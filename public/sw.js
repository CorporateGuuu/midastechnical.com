// Service Worker for MDTS - Midas Technical Solutions

const CACHE_NAME = 'mdts-cache-v1';
const OFFLINE_URL = '/offline';
const SYNC_QUEUE_NAME = 'mdts-sync-queue';
const API_CACHE_NAME = 'mdts-api-cache-v1';

// Resources to cache
const STATIC_RESOURCES = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/styles/globals.css',
  '/images/logo.svg',
  '/images/placeholder.svg'
];

// API routes to cache
const API_ROUTES = [
  '/api/products',
  '/api/categories',
  '/api/featured-products'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened static cache');
          return cache.addAll(STATIC_RESOURCES);
        }),

      // Create API cache
      caches.open(API_CACHE_NAME)
        .then((cache) => {
          console.log('Opened API cache');
          // We don't pre-cache API responses, just create the cache
        })
    ])
    .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep current caches
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle POST requests that might need to be queued when offline
  if (event.request.method === 'POST') {
    // For form submissions that need to work offline
    if (
      event.request.url.includes('/api/cart') ||
      event.request.url.includes('/api/wishlist') ||
      event.request.url.includes('/api/contact')
    ) {
      return handlePostRequest(event);
    }
    return;
  }

  // Skip non-GET requests that aren't POST
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip browser-sync requests
  if (event.request.url.includes('browser-sync')) {
    return;
  }

  // For API requests that should be cached
  if (event.request.url.includes('/api/')) {
    // Check if this is a cacheable API route
    const isApiCacheable = API_ROUTES.some(route =>
      event.request.url.includes(route)
    );

    if (isApiCacheable) {
      return staleWhileRevalidate(event);
    }

    return networkFirst(event);
  }

  // For page navigation requests
  if (event.request.mode === 'navigate') {
    return networkFirst(event);
  }

  // For static assets
  if (
    event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|ico)$/) ||
    event.request.url.includes('/images/') ||
    event.request.url.includes('/icons/')
  ) {
    return cacheFirst(event);
  }

  // Default strategy
  return networkFirst(event);
});

// Cache-first strategy
function cacheFirst(event) {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .then((fetchResponse) => {
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
          });
      }).catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return null;
      })
  );
}

// Network-first strategy
function networkFirst(event) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a copy of the response
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If cache fails and it's a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return null;
          });
      })
  );
}

// Stale-while-revalidate strategy for API responses
function staleWhileRevalidate(event) {
  event.respondWith(
    caches.open(API_CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update the cache with the new response
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(error => {
            console.error('Failed to fetch:', error);
            // If the network request fails, we still return the cached response
            // or null if there's no cached response
            return cachedResponse || null;
          });

        // Return the cached response immediately, or wait for the network response
        return cachedResponse || fetchPromise;
      });
    })
  );
}

// Handle POST requests that might need to be queued when offline
async function handlePostRequest(event) {
  // Try to send the request to the server
  try {
    const response = await fetch(event.request.clone());
    return response;
  } catch (error) {
    // If offline, queue the request for later
    if (!navigator.onLine) {
      // Clone the request to store it in IndexedDB
      const requestClone = event.request.clone();

      // Get the request data
      const requestData = await requestClone.json();

      // Store the request in IndexedDB for later sync
      await storeRequestForSync({
        url: requestClone.url,
        method: requestClone.method,
        headers: Array.from(requestClone.headers.entries()),
        body: requestData,
        timestamp: Date.now()
      });

      // Return a custom response to the client
      return new Response(JSON.stringify({
        success: true,
        offline: true,
        message: 'Your request has been saved and will be processed when you are back online.'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If there's another error (not offline), throw it
    throw error;
  }
}

// Store a request in IndexedDB for later sync
async function storeRequestForSync(requestData) {
  // Open (or create) the IndexedDB database
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('mdts-offline-requests', 1);

    // Create object store if it doesn't exist
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    };

    dbRequest.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['requests'], 'readwrite');
      const store = transaction.objectStore('requests');

      const request = store.add(requestData);

      request.onsuccess = () => {
        console.log('Request stored for later sync');

        // Register a sync if supported
        if ('sync' in self.registration) {
          self.registration.sync.register(SYNC_QUEUE_NAME)
            .then(() => console.log('Sync registered'))
            .catch(err => console.error('Sync registration failed:', err));
        }

        resolve();
      };

      request.onerror = (event) => {
        console.error('Error storing request:', event.target.error);
        reject(event.target.error);
      };
    };
  });
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if there is already a window/tab open with the target URL
        const url = event.notification.data.url;
        const client = clientList.find((c) => c.url === url);

        // If so, focus it
        if (client) {
          return client.focus();
        }
        // If not, open a new window/tab
        return clients.openWindow(url);
      })
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_QUEUE_NAME) {
    event.waitUntil(syncOfflineRequests());
  }
});

// Periodic sync event for content updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateCachedContent());
  }
});

// Process offline requests when back online
async function syncOfflineRequests() {
  try {
    const requests = await getStoredRequests();

    console.log(`Found ${requests.length} requests to sync`);

    // Process each stored request
    const syncPromises = requests.map(async (storedRequest) => {
      try {
        // Create a new request from the stored data
        const request = new Request(storedRequest.url, {
          method: storedRequest.method,
          headers: new Headers(storedRequest.headers),
          body: JSON.stringify(storedRequest.body)
        });

        // Send the request
        const response = await fetch(request);

        if (response.ok) {
          console.log(`Synced request to ${storedRequest.url}`);
          // Remove the request from storage if successful
          await removeStoredRequest(storedRequest.id);

          // Show a notification that the sync was successful
          if ('Notification' in self && self.registration.showNotification) {
            await self.registration.showNotification('Sync Complete', {
              body: 'Your offline changes have been successfully synced.',
              icon: '/icons/icon-192x192.png',
              badge: '/icons/badge-72x72.png'
            });
          }
        } else {
          console.error(`Failed to sync request to ${storedRequest.url}: ${response.status}`);
          // Keep the request in storage to try again later
        }
      } catch (error) {
        console.error(`Error syncing request to ${storedRequest.url}:`, error);
        // Keep the request in storage to try again later
      }
    });

    await Promise.all(syncPromises);
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

// Get all stored requests from IndexedDB
function getStoredRequests() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('mdts-offline-requests', 1);

    dbRequest.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['requests'], 'readonly');
      const store = transaction.objectStore('requests');

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Error getting stored requests:', event.target.error);
        reject(event.target.error);
      };
    };
  });
}

// Remove a stored request from IndexedDB
function removeStoredRequest(id) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('mdts-offline-requests', 1);

    dbRequest.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['requests'], 'readwrite');
      const store = transaction.objectStore('requests');

      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error removing stored request:', event.target.error);
        reject(event.target.error);
      };
    };
  });
}

// Update cached content periodically
async function updateCachedContent() {
  try {
    // Update frequently changing content
    const contentToUpdate = [
      '/',
      '/products',
      '/api/featured-products',
      '/api/categories'
    ];

    const cache = await caches.open(CACHE_NAME);

    // Fetch and cache each URL
    const updatePromises = contentToUpdate.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log(`Updated cached content for ${url}`);
        }
      } catch (error) {
        console.error(`Failed to update cached content for ${url}:`, error);
      }
    });

    await Promise.all(updatePromises);

    console.log('Content update complete');
  } catch (error) {
    console.error('Error updating cached content:', error);
  }
}

class BusinessIntelligenceTracker {
  constructor() {
    this.events = [];
    this.conversionFunnel = {
      pageViews: 0,
      productViews: 0,
      addToCarts: 0,
      checkoutStarts: 0,
      purchases: 0,
    };
  }

  // Conversion funnel tracking
  trackPageView(page) {
    this.conversionFunnel.pageViews++;
    this.trackEvent('page_view', { page });
  }

  trackProductView(product) {
    this.conversionFunnel.productViews++;
    this.trackEvent('product_view', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
    });
  }

  trackAddToCart(product, quantity = 1) {
    this.conversionFunnel.addToCarts++;
    this.trackEvent('add_to_cart', {
      productId: product.id,
      quantity: quantity,
      value: product.price * quantity,
    });
  }

  trackCheckoutStart(cart) {
    this.conversionFunnel.checkoutStarts++;
    const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.trackEvent('checkout_start', {
      cartValue: totalValue,
      itemCount: cart.length,
    });
  }

  trackPurchase(order) {
    this.conversionFunnel.purchases++;
    this.trackEvent('purchase', {
      orderId: order.id,
      value: order.total,
      items: order.items,
      paymentMethod: order.paymentMethod,
    });
  }

  // Customer behavior tracking
  trackSearch(query, results) {
    this.trackEvent('search', {
      query: query,
      resultCount: results.length,
      hasResults: results.length > 0,
    });
  }

  trackCategoryView(category) {
    this.trackEvent('category_view', {
      category: category.name,
      productCount: category.productCount,
    });
  }

  trackWishlistAdd(product) {
    this.trackEvent('wishlist_add', {
      productId: product.id,
      productName: product.name,
    });
  }

  // Inventory monitoring
  trackLowStock(product) {
    this.trackEvent('low_stock_alert', {
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      threshold: product.lowStockThreshold,
    });
  }

  trackOutOfStock(product) {
    this.trackEvent('out_of_stock', {
      productId: product.id,
      productName: product.name,
    });
  }

  // Customer satisfaction
  trackReview(review) {
    this.trackEvent('review_submitted', {
      productId: review.productId,
      rating: review.rating,
      hasComment: !!review.comment,
    });
  }

  trackSupportTicket(ticket) {
    this.trackEvent('support_ticket', {
      category: ticket.category,
      priority: ticket.priority,
      source: ticket.source,
    });
  }

  // Core tracking method
  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      data: data,
    };

    this.events.push(event);

    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, data);
    }

    // Send to business intelligence endpoint
    this.sendToBI(event);
  }

  sendToBI(event) {
    fetch('/api/analytics/business-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(console.error);
  }

  getSessionId() {
    if (typeof window === 'undefined') return null;

    let sessionId = sessionStorage.getItem('bi_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('bi_session_id', sessionId);
    }
    return sessionId;
  }

  getUserId() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_id') || null;
  }

  getConversionFunnel() {
    return {
      ...this.conversionFunnel,
      conversionRates: {
        productViewToCart: this.conversionFunnel.addToCarts / this.conversionFunnel.productViews,
        cartToCheckout: this.conversionFunnel.checkoutStarts / this.conversionFunnel.addToCarts,
        checkoutToPurchase: this.conversionFunnel.purchases / this.conversionFunnel.checkoutStarts,
        overallConversion: this.conversionFunnel.purchases / this.conversionFunnel.pageViews,
      },
    };
  }
}

export default BusinessIntelligenceTracker;

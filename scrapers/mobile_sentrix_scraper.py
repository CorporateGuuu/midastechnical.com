"""
Comprehensive Mobile Sentrix scraper implementation.
"""
import asyncio
import re
import json
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from scrapers.base_scraper import BaseScraper

class MobileSentrixScraper(BaseScraper):
    """Comprehensive scraper for Mobile Sentrix website."""

    def __init__(self):
        """Initialize the scraper."""
        super().__init__('mobile_sentrix')
        self.base_url = 'https://www.mobilesentrix.com'
        self.scraped_urls = set()
        self.failed_urls = set()
        self.category_mapping = {
            'iphone': 'iPhone Parts',
            'samsung': 'Samsung Parts',
            'ipad': 'iPad Parts',
            'macbook': 'MacBook Parts',
            'lcd': 'LCD Screens',
            'battery': 'Batteries',
            'charging': 'Charging Ports',
            'camera': 'Cameras',
            'speaker': 'Speakers',
            'tool': 'Repair Tools',
            'screen': 'LCD Screens',
            'display': 'LCD Screens'
        }

    async def get_category_links(self, session):
        """Get comprehensive category links to scrape."""
        self.logger.info("Getting category links from MobileSentrix")

        category_links = []

        # Define known category paths based on MobileSentrix structure
        known_categories = [
            '/replacement-parts/apple/iphone-parts',
            '/replacement-parts/apple/ipad-parts',
            '/replacement-parts/apple/macbook-parts',
            '/replacement-parts/samsung/galaxy-s-series',
            '/replacement-parts/samsung/galaxy-note-series',
            '/replacement-parts/samsung/galaxy-a-series',
            '/replacement-parts/lg',
            '/replacement-parts/google',
            '/replacement-parts/oneplus',
            '/replacement-parts/motorola',
            '/tools-and-supplies/repair-tools',
            '/tools-and-supplies/adhesives',
            '/tools-and-supplies/cleaning-supplies'
        ]

        # Add specific iPhone model categories
        iphone_models = [
            'iphone-15', 'iphone-15-plus', 'iphone-15-pro', 'iphone-15-pro-max',
            'iphone-14', 'iphone-14-plus', 'iphone-14-pro', 'iphone-14-pro-max',
            'iphone-13', 'iphone-13-mini', 'iphone-13-pro', 'iphone-13-pro-max',
            'iphone-12', 'iphone-12-mini', 'iphone-12-pro', 'iphone-12-pro-max',
            'iphone-11', 'iphone-11-pro', 'iphone-11-pro-max',
            'iphone-x', 'iphone-xs', 'iphone-xs-max', 'iphone-xr'
        ]

        for model in iphone_models:
            known_categories.append(f'/replacement-parts/apple/iphone-parts/{model}')

        # Add Samsung Galaxy S series
        galaxy_s_models = [
            'galaxy-s25', 'galaxy-s25-plus', 'galaxy-s25-ultra',
            'galaxy-s24', 'galaxy-s24-plus', 'galaxy-s24-ultra', 'galaxy-s24-fe',
            'galaxy-s23', 'galaxy-s23-plus', 'galaxy-s23-ultra', 'galaxy-s23-fe',
            'galaxy-s22', 'galaxy-s22-plus', 'galaxy-s22-ultra',
            'galaxy-s21', 'galaxy-s21-plus', 'galaxy-s21-ultra'
        ]

        for model in galaxy_s_models:
            known_categories.append(f'/replacement-parts/samsung/galaxy-s-series/{model}')

        # Convert to full URLs and validate
        for category_path in known_categories:
            full_url = urljoin(self.base_url, category_path)
            category_links.append(full_url)
            self.logger.debug(f"Added category link: {full_url}")

        # Also try to discover categories from the main navigation
        try:
            html = await self.fetch_with_retry(session, self.base_url)
            if html:
                soup = BeautifulSoup(html, 'html.parser')

                # Look for navigation links
                nav_links = soup.find_all('a', href=True)
                for link in nav_links:
                    href = link.get('href', '')
                    if any(keyword in href.lower() for keyword in ['replacement-parts', 'tools', 'supplies']):
                        full_url = urljoin(self.base_url, href)
                        if full_url not in category_links:
                            category_links.append(full_url)
                            self.logger.debug(f"Discovered category link: {full_url}")
        except Exception as e:
            self.logger.warning(f"Could not discover additional categories: {e}")

        self.logger.info(f"Found {len(category_links)} category links to scrape")
        return category_links

    async def scrape_category(self, session, category_url, page=1, max_pages=10):
        """Scrape a category page with pagination support."""
        if category_url in self.scraped_urls:
            return

        self.logger.info(f"Scraping category page {page}: {category_url}")
        self.scraped_urls.add(category_url)

        # Extract category name from URL for mapping
        category_name = self._extract_category_name(category_url)

        # Fetch the category page
        html = await self.fetch_with_retry(session, category_url)
        if not html:
            self.failed_urls.add(category_url)
            return

        soup = BeautifulSoup(html, 'html.parser')

        # Find product links using multiple selectors
        product_links = []

        # Try different selectors that MobileSentrix might use
        selectors = [
            'a[href*="/product/"]',
            'a[href*="/replacement-parts/"]',
            '.product-item a',
            '.product-card a',
            '.product-link',
            'a.product-title',
            '.product-name a'
        ]

        for selector in selectors:
            elements = soup.select(selector)
            for link in elements:
                href = link.get('href')
                if href and self._is_product_url(href):
                    full_url = urljoin(self.base_url, href)
                    if full_url not in product_links:
                        product_links.append(full_url)

        self.logger.info(f"Found {len(product_links)} product links on page {page}")

        # Scrape each product (no limit for comprehensive scraping)
        for i, product_url in enumerate(product_links):
            if product_url in self.scraped_urls:
                continue

            self.logger.debug(f"Scraping product {i+1}/{len(product_links)}: {product_url}")
            product_data = await self.scrape_product(session, product_url)

            if product_data:
                # Add category to product data
                product_data['category'] = category_name
                product_data['source_url'] = product_url
                self.products_data.append(product_data)

            # Rate limiting
            await asyncio.sleep(self.rate_limit_delay)

        # Handle pagination
        if page < max_pages:
            next_page_url = self._find_next_page(soup, category_url)
            if next_page_url and next_page_url not in self.scraped_urls:
                await asyncio.sleep(self.rate_limit_delay)
                await self.scrape_category(session, next_page_url, page + 1, max_pages)

    def _extract_category_name(self, url):
        """Extract and map category name from URL."""
        url_lower = url.lower()

        # Check for specific mappings
        for keyword, category in self.category_mapping.items():
            if keyword in url_lower:
                return category

        # Extract from URL path
        if '/replacement-parts/' in url_lower:
            parts = url.split('/')
            if 'apple' in url_lower:
                if 'iphone' in url_lower:
                    return 'iPhone Parts'
                elif 'ipad' in url_lower:
                    return 'iPad Parts'
                elif 'macbook' in url_lower:
                    return 'MacBook Parts'
                else:
                    return 'iPhone Parts'  # Default for Apple
            elif 'samsung' in url_lower:
                return 'Samsung Parts'
            elif 'tools' in url_lower:
                return 'Repair Tools'

        return 'iPhone Parts'  # Default category

    def _is_product_url(self, href):
        """Check if URL is a product URL."""
        if not href:
            return False

        # Skip non-product URLs
        skip_patterns = [
            '/category/', '/search/', '/cart/', '/checkout/',
            '/account/', '/login/', '/register/', '/contact/',
            'javascript:', 'mailto:', 'tel:', '#'
        ]

        for pattern in skip_patterns:
            if pattern in href.lower():
                return False

        # Check for product indicators
        product_indicators = [
            '/replacement-parts/',
            '/tools-and-supplies/',
            '/product/',
            '/item/'
        ]

        return any(indicator in href.lower() for indicator in product_indicators)

    def _find_next_page(self, soup, current_url):
        """Find next page URL."""
        # Try different pagination selectors
        next_selectors = [
            'a.next',
            'a[rel="next"]',
            '.pagination .next a',
            '.pager .next a',
            'a:contains("Next")',
            'a:contains(">")'
        ]

        for selector in next_selectors:
            next_link = soup.select_one(selector)
            if next_link and next_link.get('href'):
                return urljoin(self.base_url, next_link.get('href'))

        # Try to construct next page URL
        if '?page=' in current_url:
            # Extract current page number and increment
            match = re.search(r'page=(\d+)', current_url)
            if match:
                current_page = int(match.group(1))
                next_page_url = re.sub(r'page=\d+', f'page={current_page + 1}', current_url)
                return next_page_url
        elif 'page=' not in current_url:
            # Add page parameter
            separator = '&' if '?' in current_url else '?'
            return f"{current_url}{separator}page=2"

        return None

    async def scrape_product(self, session, product_url):
        """Scrape a product page comprehensively."""
        if product_url in self.scraped_urls:
            return None

        self.scraped_urls.add(product_url)
        self.logger.debug(f"Scraping product: {product_url}")

        # Fetch the product page
        html = await self.fetch_with_retry(session, product_url)
        if not html:
            self.failed_urls.add(product_url)
            return None

        soup = BeautifulSoup(html, 'html.parser')

        try:
            # Extract product name using multiple selectors
            product_name = self._extract_text_by_selectors(soup, [
                'h1.product-title',
                'h1.product-name',
                'h1',
                '.product-title',
                '.product-name',
                '.title'
            ])

            if not product_name:
                self.logger.warning(f"Could not extract product name from {product_url}")
                return None

            # Extract price using multiple selectors
            price = self._extract_price(soup)

            # Extract brand
            brand = self._extract_text_by_selectors(soup, [
                '.brand',
                '.manufacturer',
                '.product-brand',
                '[data-brand]'
            ]) or self._extract_brand_from_name(product_name)

            # Extract images
            image_urls = self._extract_images(soup)
            primary_image = image_urls[0] if image_urls else None

            # Extract description
            description = self._extract_description(soup, product_name)

            # Extract SKU/Model
            sku = self._extract_text_by_selectors(soup, [
                '.sku',
                '.model',
                '.product-code',
                '[data-sku]'
            ])

            # Extract stock status
            stock_status = self._extract_stock_status(soup)

            # Extract specifications
            specifications = self._extract_specifications(soup)

            # Extract additional details
            compatibility = self._extract_compatibility(soup, product_name)

            # Create comprehensive product data
            product_data = {
                'name': product_name,
                'price': price,
                'brand': brand,
                'sku': sku,
                'image_url': primary_image,
                'additional_images': image_urls[1:] if len(image_urls) > 1 else [],
                'description': description,
                'stock_status': stock_status,
                'compatibility': compatibility,
                'specifications': specifications,
                'source_url': product_url
            }

            self.logger.debug(f"Successfully extracted: {product_name} - ${price}")
            return product_data

        except Exception as e:
            self.logger.error(f"Error scraping product {product_url}: {e}")
            self.failed_urls.add(product_url)
            return None

    def _extract_text_by_selectors(self, soup, selectors):
        """Extract text using multiple CSS selectors."""
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if text:
                    return text
        return None

    def _extract_price(self, soup):
        """Extract price from product page."""
        price_selectors = [
            '.price',
            '.product-price',
            '.current-price',
            '.sale-price',
            '[data-price]',
            '.price-current',
            '.price-value'
        ]

        for selector in price_selectors:
            element = soup.select_one(selector)
            if element:
                price_text = element.get_text(strip=True)
                # Extract numeric price
                price_match = re.search(r'\$?(\d+\.?\d*)', price_text.replace(',', ''))
                if price_match:
                    try:
                        return float(price_match.group(1))
                    except ValueError:
                        continue

        return 0.0

    def _extract_brand_from_name(self, product_name):
        """Extract brand from product name."""
        brands = ['Apple', 'Samsung', 'LG', 'Google', 'OnePlus', 'Motorola', 'Huawei', 'Xiaomi']
        name_lower = product_name.lower()

        for brand in brands:
            if brand.lower() in name_lower:
                return brand

        # Check for iPhone/iPad (Apple products)
        if any(keyword in name_lower for keyword in ['iphone', 'ipad', 'macbook', 'imac']):
            return 'Apple'

        # Check for Galaxy (Samsung products)
        if 'galaxy' in name_lower:
            return 'Samsung'

        return 'Generic'

    def _extract_images(self, soup):
        """Extract product images."""
        image_urls = []

        # Try different image selectors
        image_selectors = [
            '.product-image img',
            '.product-gallery img',
            '.product-photos img',
            '.main-image img',
            'img[data-src]',
            'img[src*="product"]'
        ]

        for selector in image_selectors:
            images = soup.select(selector)
            for img in images:
                src = img.get('src') or img.get('data-src')
                if src and self._is_valid_image_url(src):
                    full_url = urljoin(self.base_url, src)
                    if full_url not in image_urls:
                        image_urls.append(full_url)

        return image_urls

    def _is_valid_image_url(self, url):
        """Check if URL is a valid image URL."""
        if not url:
            return False

        # Skip placeholder, icon, or non-product images
        skip_patterns = ['placeholder', 'icon', 'logo', 'sprite', 'blank']
        url_lower = url.lower()

        if any(pattern in url_lower for pattern in skip_patterns):
            return False

        # Check for image extensions
        image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        return any(ext in url_lower for ext in image_extensions)

    def _extract_description(self, soup, product_name):
        """Extract product description."""
        desc_selectors = [
            '.product-description',
            '.description',
            '.product-details',
            '.product-info',
            '.product-summary'
        ]

        description = self._extract_text_by_selectors(soup, desc_selectors)

        if not description:
            # Generate basic description from product name
            description = f"High-quality {product_name.lower()} replacement part. Professional grade component designed for optimal performance and durability."

        return description

    def _extract_stock_status(self, soup):
        """Extract stock availability status."""
        stock_selectors = [
            '.stock-status',
            '.availability',
            '.in-stock',
            '.out-of-stock'
        ]

        for selector in stock_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True).lower()
                if 'in stock' in text or 'available' in text:
                    return 'in_stock'
                elif 'out of stock' in text or 'unavailable' in text:
                    return 'out_of_stock'

        return 'in_stock'  # Default to in stock

    def _extract_specifications(self, soup):
        """Extract product specifications."""
        specs = {}

        # Try to find specifications table
        spec_tables = soup.select('table.specifications, .specs-table, .product-specs table')

        for table in spec_tables:
            rows = table.select('tr')
            for row in rows:
                cells = row.select('td, th')
                if len(cells) >= 2:
                    key = cells[0].get_text(strip=True).lower().replace(' ', '_')
                    value = cells[1].get_text(strip=True)
                    if key and value:
                        specs[key] = value

        # Try to find specifications in definition lists
        spec_lists = soup.select('.specifications dl, .specs dl, .product-specs dl')

        for dl in spec_lists:
            terms = dl.select('dt')
            definitions = dl.select('dd')

            for term, definition in zip(terms, definitions):
                key = term.get_text(strip=True).lower().replace(' ', '_')
                value = definition.get_text(strip=True)
                if key and value:
                    specs[key] = value

        return specs

    def _extract_compatibility(self, soup, product_name):
        """Extract compatibility information."""
        compatibility = []

        # Look for compatibility information
        compat_selectors = [
            '.compatibility',
            '.compatible-with',
            '.fits',
            '.works-with'
        ]

        for selector in compat_selectors:
            element = soup.select_one(selector)
            if element:
                compat_text = element.get_text(strip=True)
                if compat_text:
                    compatibility.append(compat_text)

        # Extract from product name
        name_lower = product_name.lower()

        # iPhone models
        iphone_models = re.findall(r'iphone\s*(\d+(?:\s*pro)?(?:\s*max)?(?:\s*plus)?(?:\s*mini)?)', name_lower)
        for model in iphone_models:
            compatibility.append(f"iPhone {model}")

        # Samsung models
        samsung_models = re.findall(r'galaxy\s*s(\d+)(?:\s*(ultra|plus|fe))?', name_lower)
        for model, variant in samsung_models:
            compat = f"Galaxy S{model}"
            if variant:
                compat += f" {variant.title()}"
            compatibility.append(compat)

        return list(set(compatibility))  # Remove duplicates

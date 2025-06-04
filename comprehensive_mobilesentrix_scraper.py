#!/usr/bin/env node

"""
Comprehensive MobileSentrix scraper with database integration and image processing.
"""

import asyncio
import sys
import os
import logging
from datetime import datetime
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from scrapers.mobile_sentrix_scraper import MobileSentrixScraper
from scrapers.db_repository import ProductRepository
import subprocess
import json
from urllib.parse import urlparse
import requests
from PIL import Image
import io

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mobilesentrix_scraper.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class ComprehensiveMobileSentrixScraper:
    """Comprehensive scraper with database integration and image processing."""
    
    def __init__(self):
        """Initialize the comprehensive scraper."""
        self.scraper = MobileSentrixScraper()
        self.scraped_count = 0
        self.imported_count = 0
        self.image_count = 0
        self.error_count = 0
        self.start_time = datetime.now()
        
        # Database connection (using Node.js/PostgreSQL)
        self.db_name = 'midastechnical_store'
        
        # Image processing settings
        self.image_base_dir = project_root / 'public' / 'images' / 'products'
        self.image_base_dir.mkdir(parents=True, exist_ok=True)
        
        # Category directories
        self.category_dirs = {
            'iPhone Parts': self.image_base_dir / 'iphone',
            'Samsung Parts': self.image_base_dir / 'samsung',
            'iPad Parts': self.image_base_dir / 'ipad',
            'MacBook Parts': self.image_base_dir / 'macbook',
            'LCD Screens': self.image_base_dir / 'lcd',
            'Batteries': self.image_base_dir / 'batteries',
            'Charging Ports': self.image_base_dir / 'charging',
            'Cameras': self.image_base_dir / 'cameras',
            'Speakers': self.image_base_dir / 'speakers',
            'Repair Tools': self.image_base_dir / 'tools'
        }
        
        # Create category directories
        for category_dir in self.category_dirs.values():
            category_dir.mkdir(parents=True, exist_ok=True)
    
    async def run_comprehensive_scraping(self):
        """Run the comprehensive scraping operation."""
        logger.info("🚀 Starting comprehensive MobileSentrix scraping operation")
        logger.info(f"Target: https://www.mobilesentrix.com/")
        logger.info(f"Database: {self.db_name}")
        logger.info(f"Image storage: {self.image_base_dir}")
        
        try:
            # Step 1: Run the scraper
            logger.info("📡 Phase 1: Web scraping")
            await self.scraper.run()
            
            self.scraped_count = len(self.scraper.products_data)
            logger.info(f"✅ Scraped {self.scraped_count} products")
            
            if self.scraped_count == 0:
                logger.warning("No products were scraped. Exiting.")
                return
            
            # Step 2: Process and import data
            logger.info("💾 Phase 2: Database import")
            await self.import_to_database()
            
            # Step 3: Download and process images
            logger.info("🖼️ Phase 3: Image processing")
            await self.process_images()
            
            # Step 4: Generate report
            logger.info("📊 Phase 4: Generating report")
            await self.generate_report()
            
            logger.info("🎉 Comprehensive scraping operation completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Scraping operation failed: {e}")
            raise
    
    async def import_to_database(self):
        """Import scraped data to PostgreSQL database."""
        logger.info("Importing products to database...")
        
        # Prepare data for Node.js import script
        import_data = []
        
        for product in self.scraper.products_data:
            try:
                # Generate SKU
                category = product.get('category', 'iPhone Parts')
                category_code = self._get_category_code(category)
                sku = f"MDTS-{category_code}-{len(import_data):04d}"
                
                # Prepare product data
                product_data = {
                    'name': product.get('name', '').strip(),
                    'sku': sku,
                    'price': float(product.get('price', 0)),
                    'category': category,
                    'brand': product.get('brand', 'Generic'),
                    'description': product.get('description', ''),
                    'image_url': product.get('image_url', ''),
                    'stock_quantity': 50,  # Default stock
                    'is_featured': False,
                    'is_new': True,
                    'specifications': product.get('specifications', {}),
                    'compatibility': product.get('compatibility', []),
                    'source_url': product.get('source_url', '')
                }
                
                # Validate required fields
                if product_data['name'] and product_data['price'] > 0:
                    import_data.append(product_data)
                else:
                    logger.warning(f"Skipping invalid product: {product_data['name']}")
                    
            except Exception as e:
                logger.error(f"Error preparing product data: {e}")
                self.error_count += 1
        
        # Save to JSON file for Node.js import
        import_file = project_root / 'scraped_products.json'
        with open(import_file, 'w') as f:
            json.dump(import_data, f, indent=2)
        
        logger.info(f"Prepared {len(import_data)} products for import")
        
        # Run Node.js import script
        try:
            result = subprocess.run([
                'node', '-e', f'''
                const fs = require('fs');
                const {{ Pool }} = require('pg');
                
                const pool = new Pool({{
                    connectionString: 'postgresql://postgres:postgres@localhost:5432/{self.db_name}'
                }});
                
                async function importProducts() {{
                    const data = JSON.parse(fs.readFileSync('{import_file}', 'utf8'));
                    let imported = 0;
                    
                    for (const product of data) {{
                        try {{
                            // Get category ID
                            const categoryResult = await pool.query(
                                'SELECT id FROM categories WHERE name = $1',
                                [product.category]
                            );
                            
                            if (categoryResult.rows.length === 0) {{
                                console.warn(`Category not found: ${{product.category}}`);
                                continue;
                            }}
                            
                            const categoryId = categoryResult.rows[0].id;
                            
                            // Check if product already exists
                            const existingResult = await pool.query(
                                'SELECT id FROM products WHERE sku = $1',
                                [product.sku]
                            );
                            
                            if (existingResult.rows.length > 0) {{
                                console.log(`Product already exists: ${{product.sku}}`);
                                continue;
                            }}
                            
                            // Insert product
                            await pool.query(`
                                INSERT INTO products (
                                    name, sku, price, category_id, brand, description,
                                    image_url, stock_quantity, is_featured, is_new
                                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                            `, [
                                product.name, product.sku, product.price, categoryId,
                                product.brand, product.description, product.image_url,
                                product.stock_quantity, product.is_featured, product.is_new
                            ]);
                            
                            imported++;
                            
                        }} catch (error) {{
                            console.error(`Error importing product ${{product.sku}}: ${{error.message}}`);
                        }}
                    }}
                    
                    console.log(`Successfully imported ${{imported}} products`);
                    await pool.end();
                    return imported;
                }}
                
                importProducts().then(count => {{
                    console.log(`Import completed: ${{count}} products`);
                    process.exit(0);
                }}).catch(error => {{
                    console.error('Import failed:', error);
                    process.exit(1);
                }});
                '''
            ], capture_output=True, text=True, cwd=project_root)
            
            if result.returncode == 0:
                # Extract imported count from output
                output_lines = result.stdout.strip().split('\n')
                for line in output_lines:
                    if 'Successfully imported' in line:
                        self.imported_count = int(line.split()[-2])
                        break
                
                logger.info(f"✅ Successfully imported {self.imported_count} products to database")
            else:
                logger.error(f"Database import failed: {result.stderr}")
                
        except Exception as e:
            logger.error(f"Error running database import: {e}")
        
        # Clean up temporary file
        if import_file.exists():
            import_file.unlink()
    
    async def process_images(self):
        """Download and process product images."""
        logger.info("Processing product images...")
        
        for product in self.scraper.products_data:
            try:
                image_url = product.get('image_url')
                if not image_url:
                    continue
                
                category = product.get('category', 'iPhone Parts')
                category_dir = self.category_dirs.get(category, self.category_dirs['iPhone Parts'])
                
                # Generate filename
                sku = product.get('sku', f"MDTS-{self.image_count:04d}")
                filename = f"{sku}.webp"
                filepath = category_dir / filename
                
                # Skip if already exists
                if filepath.exists():
                    continue
                
                # Download image
                success = await self._download_and_optimize_image(image_url, filepath)
                if success:
                    self.image_count += 1
                    
                    # Update product with local image path
                    local_path = f"/images/products/{category_dir.name}/{filename}"
                    product['local_image_url'] = local_path
                    
                # Rate limiting
                await asyncio.sleep(0.5)
                
            except Exception as e:
                logger.error(f"Error processing image for product: {e}")
                self.error_count += 1
        
        logger.info(f"✅ Processed {self.image_count} images")
    
    async def _download_and_optimize_image(self, url, filepath):
        """Download and optimize a single image."""
        try:
            # Download image
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Open and optimize image
            image = Image.open(io.BytesIO(response.content))
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Resize if too large
            max_size = (800, 800)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save as WebP
            image.save(filepath, 'WEBP', quality=85, optimize=True)
            
            # Create thumbnail
            thumb_path = filepath.parent / f"{filepath.stem}_thumb.webp"
            thumb_image = image.copy()
            thumb_image.thumbnail((300, 300), Image.Resampling.LANCZOS)
            thumb_image.save(thumb_path, 'WEBP', quality=75, optimize=True)
            
            return True
            
        except Exception as e:
            logger.warning(f"Failed to download/optimize image {url}: {e}")
            return False
    
    def _get_category_code(self, category):
        """Get category code for SKU generation."""
        codes = {
            'iPhone Parts': 'IP',
            'Samsung Parts': 'SP',
            'iPad Parts': 'IPD',
            'MacBook Parts': 'MBP',
            'LCD Screens': 'LCD',
            'Batteries': 'BAT',
            'Charging Ports': 'CP',
            'Cameras': 'CAM',
            'Speakers': 'SPK',
            'Repair Tools': 'TL'
        }
        return codes.get(category, 'IP')
    
    async def generate_report(self):
        """Generate comprehensive scraping report."""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        report = f"""
🎉 MOBILESENTRIX SCRAPING OPERATION COMPLETE
{'=' * 60}

📊 OPERATION SUMMARY:
   Start Time: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}
   End Time: {end_time.strftime('%Y-%m-%d %H:%M:%S')}
   Duration: {duration}
   
📦 SCRAPING RESULTS:
   Products Scraped: {self.scraped_count}
   Products Imported: {self.imported_count}
   Images Processed: {self.image_count}
   Errors Encountered: {self.error_count}
   
🎯 SUCCESS METRICS:
   Scraping Success Rate: {(self.scraped_count / max(1, self.scraped_count + self.error_count)) * 100:.1f}%
   Import Success Rate: {(self.imported_count / max(1, self.scraped_count)) * 100:.1f}%
   Image Success Rate: {(self.image_count / max(1, self.scraped_count)) * 100:.1f}%
   
📁 FILES CREATED:
   Images: {self.image_base_dir}
   Log: mobilesentrix_scraper.log
   
🔗 NEXT STEPS:
   1. Verify products at: http://localhost:3002/products
   2. Check admin panel: http://localhost:3002/admin
   3. Run data validation: node validate_data_quality.js
   
✅ OPERATION STATUS: {'SUCCESS' if self.imported_count >= 100 else 'PARTIAL SUCCESS'}
"""
        
        logger.info(report)
        
        # Save report to file
        report_file = project_root / f'scraping_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'
        with open(report_file, 'w') as f:
            f.write(report)
        
        logger.info(f"📄 Report saved to: {report_file}")

async def main():
    """Main function to run the comprehensive scraper."""
    scraper = ComprehensiveMobileSentrixScraper()
    await scraper.run_comprehensive_scraping()

if __name__ == "__main__":
    asyncio.run(main())

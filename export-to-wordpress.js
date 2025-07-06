#!/usr/bin/env node

/**
 * Next.js to WordPress Data Export Script
 * Exports products, categories, and users to WordPress-compatible CSV format
 */

const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

class WordPressExporter {
  constructor() {
    this.outputDir = './wordpress-export';
    this.ensureOutputDirectory();
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Export products to WooCommerce-compatible CSV
   */
  async exportProducts() {
    console.log('🔄 Exporting products...');

    // Read existing product data
    const productsData = this.loadProductData();
    
    const csvWriter = createObjectCsvWriter({
      path: path.join(this.outputDir, 'products.csv'),
      header: [
        { id: 'name', title: 'Name' },
        { id: 'sku', title: 'SKU' },
        { id: 'regular_price', title: 'Regular price' },
        { id: 'sale_price', title: 'Sale price' },
        { id: 'stock_quantity', title: 'Stock' },
        { id: 'manage_stock', title: 'Manage stock?' },
        { id: 'stock_status', title: 'Stock status' },
        { id: 'categories', title: 'Categories' },
        { id: 'images', title: 'Images' },
        { id: 'description', title: 'Description' },
        { id: 'short_description', title: 'Short description' },
        { id: 'brand', title: 'Brand' },
        { id: 'weight', title: 'Weight (kg)' },
        { id: 'dimensions', title: 'Dimensions (L x W x H)' },
        { id: 'featured', title: 'Featured?' },
        { id: 'visibility', title: 'Visibility in catalog' },
        { id: 'tax_status', title: 'Tax status' },
        { id: 'tax_class', title: 'Tax class' },
        { id: 'meta_compatibility', title: 'Meta: compatibility' },
        { id: 'meta_condition', title: 'Meta: condition' },
        { id: 'meta_screen_size', title: 'Meta: screen_size' },
        { id: 'meta_color', title: 'Meta: color' },
        { id: 'meta_storage', title: 'Meta: storage' }
      ]
    });

    const wooCommerceProducts = productsData.map(product => ({
      name: product.name,
      sku: product.sku || `MDTS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      regular_price: product.price,
      sale_price: product.discount_percentage > 0 ? 
        (product.price * (1 - product.discount_percentage / 100)).toFixed(2) : '',
      stock_quantity: product.stock_quantity || 0,
      manage_stock: 'yes',
      stock_status: product.stock_quantity > 0 ? 'instock' : 'outofstock',
      categories: this.formatCategories(product.category),
      images: this.formatImages(product.image_url),
      description: product.description || `High-quality ${product.name} for device repair and maintenance.`,
      short_description: this.generateShortDescription(product),
      brand: product.brand || 'Generic',
      weight: '0.1',
      dimensions: '10 x 5 x 2',
      featured: product.is_featured ? 'yes' : 'no',
      visibility: 'visible',
      tax_status: 'taxable',
      tax_class: '',
      meta_compatibility: this.extractCompatibility(product.name),
      meta_condition: 'New',
      meta_screen_size: this.extractScreenSize(product.name),
      meta_color: this.extractColor(product.name),
      meta_storage: this.extractStorage(product.name)
    }));

    await csvWriter.writeRecords(wooCommerceProducts);
    console.log(`✅ Exported ${wooCommerceProducts.length} products to products.csv`);
  }

  /**
   * Export categories to WordPress-compatible CSV
   */
  async exportCategories() {
    console.log('🔄 Exporting categories...');

    const categories = [
      {
        name: 'Phone Parts',
        slug: 'phone-parts',
        description: 'Replacement parts and components for mobile phones',
        parent: '',
        image: 'category-phone-parts.jpg'
      },
      {
        name: 'iPhone Parts',
        slug: 'iphone-parts',
        description: 'Replacement parts specifically for iPhone devices',
        parent: 'Phone Parts',
        image: 'category-iphone-parts.jpg'
      },
      {
        name: 'Samsung Parts',
        slug: 'samsung-parts',
        description: 'Replacement parts specifically for Samsung devices',
        parent: 'Phone Parts',
        image: 'category-samsung-parts.jpg'
      },
      {
        name: 'Repair Tools',
        slug: 'repair-tools',
        description: 'Professional tools for device repair and maintenance',
        parent: '',
        image: 'category-repair-tools.jpg'
      },
      {
        name: 'Batteries',
        slug: 'batteries',
        description: 'Replacement batteries for various mobile devices',
        parent: 'Phone Parts',
        image: 'category-batteries.jpg'
      },
      {
        name: 'Screens & Displays',
        slug: 'screens-displays',
        description: 'LCD screens, OLED displays, and digitizers',
        parent: 'Phone Parts',
        image: 'category-screens.jpg'
      },
      {
        name: 'Charging Accessories',
        slug: 'charging-accessories',
        description: 'Charging cables, adapters, and wireless chargers',
        parent: '',
        image: 'category-charging.jpg'
      },
      {
        name: 'Protective Cases',
        slug: 'protective-cases',
        description: 'Phone cases and protective accessories',
        parent: '',
        image: 'category-cases.jpg'
      }
    ];

    const csvWriter = createObjectCsvWriter({
      path: path.join(this.outputDir, 'categories.csv'),
      header: [
        { id: 'name', title: 'Name' },
        { id: 'slug', title: 'Slug' },
        { id: 'description', title: 'Description' },
        { id: 'parent', title: 'Parent' },
        { id: 'image', title: 'Image' }
      ]
    });

    await csvWriter.writeRecords(categories);
    console.log(`✅ Exported ${categories.length} categories to categories.csv`);
  }

  /**
   * Export users to WordPress-compatible CSV
   */
  async exportUsers() {
    console.log('🔄 Exporting users...');

    const users = [
      {
        user_login: 'admin',
        user_email: 'admin@midastechnical.com',
        user_pass: 'temp_password_change_immediately',
        first_name: 'Admin',
        last_name: 'User',
        role: 'administrator',
        user_registered: new Date().toISOString().split('T')[0]
      }
    ];

    const csvWriter = createObjectCsvWriter({
      path: path.join(this.outputDir, 'users.csv'),
      header: [
        { id: 'user_login', title: 'user_login' },
        { id: 'user_email', title: 'user_email' },
        { id: 'user_pass', title: 'user_pass' },
        { id: 'first_name', title: 'first_name' },
        { id: 'last_name', title: 'last_name' },
        { id: 'role', title: 'role' },
        { id: 'user_registered', title: 'user_registered' }
      ]
    });

    await csvWriter.writeRecords(users);
    console.log(`✅ Exported ${users.length} users to users.csv`);
  }

  /**
   * Load product data from various sources
   */
  loadProductData() {
    // Try to load from existing CSV file first
    const csvPath = path.join(__dirname, 'data', 'products.csv');
    if (fs.existsSync(csvPath)) {
      return this.parseCSV(csvPath);
    }

    // Generate sample products if no data file exists
    return this.generateSampleProducts();
  }

  /**
   * Generate sample products for demonstration
   */
  generateSampleProducts() {
    return [
      {
        name: 'iPhone 12 Screen Replacement',
        sku: 'IP12-SCR-001',
        price: 89.99,
        discount_percentage: 10,
        stock_quantity: 25,
        category: 'iPhone Parts',
        brand: 'Apple',
        is_featured: true,
        image_url: 'iphone-12-screen.jpg',
        description: 'High-quality OLED screen replacement for iPhone 12. Perfect fit with original specifications.'
      },
      {
        name: 'Samsung Galaxy S21 Battery',
        sku: 'SG21-BAT-001',
        price: 45.99,
        discount_percentage: 0,
        stock_quantity: 30,
        category: 'Samsung Parts',
        brand: 'Samsung',
        is_featured: false,
        image_url: 'samsung-s21-battery.jpg',
        description: 'Original capacity replacement battery for Samsung Galaxy S21.'
      },
      {
        name: 'Professional Screwdriver Set',
        sku: 'TOOL-SCR-001',
        price: 29.99,
        discount_percentage: 15,
        stock_quantity: 50,
        category: 'Repair Tools',
        brand: 'ProTools',
        is_featured: true,
        image_url: 'screwdriver-set.jpg',
        description: 'Complete screwdriver set for phone and tablet repairs. Includes all common sizes.'
      }
    ];
  }

  // Helper methods
  formatCategories(category) {
    if (!category) return 'Uncategorized';
    return category.includes('iPhone') ? 'Phone Parts > iPhone Parts' : 
           category.includes('Samsung') ? 'Phone Parts > Samsung Parts' :
           category.includes('Tool') ? 'Repair Tools' : 'Phone Parts';
  }

  formatImages(imageUrl) {
    if (!imageUrl) return '';
    return imageUrl.startsWith('http') ? imageUrl : `https://midastechnical.com/images/${imageUrl}`;
  }

  generateShortDescription(product) {
    return `${product.name} - ${product.brand || 'Quality'} replacement part for device repair.`;
  }

  extractCompatibility(name) {
    if (name.includes('iPhone 12')) return 'iPhone 12';
    if (name.includes('iPhone 13')) return 'iPhone 13';
    if (name.includes('Galaxy S21')) return 'Samsung Galaxy S21';
    return 'Universal';
  }

  extractScreenSize(name) {
    if (name.includes('iPhone 12')) return '6.1 inch';
    if (name.includes('iPhone 13')) return '6.1 inch';
    if (name.includes('Galaxy S21')) return '6.2 inch';
    return '';
  }

  extractColor(name) {
    if (name.toLowerCase().includes('black')) return 'Black';
    if (name.toLowerCase().includes('white')) return 'White';
    return 'Black';
  }

  extractStorage(name) {
    if (name.includes('64GB')) return '64GB';
    if (name.includes('128GB')) return '128GB';
    if (name.includes('256GB')) return '256GB';
    return '';
  }

  /**
   * Run complete export process
   */
  async runExport() {
    console.log('🚀 Starting WordPress export process...\n');

    try {
      await this.exportCategories();
      await this.exportProducts();
      await this.exportUsers();

      console.log('\n✅ Export completed successfully!');
      console.log(`📁 Files saved to: ${this.outputDir}`);
      console.log('\n📋 Next steps:');
      console.log('1. Review the exported CSV files');
      console.log('2. Upload to WordPress using WP All Import plugin');
      console.log('3. Configure WooCommerce settings');
      console.log('4. Test the imported data');

    } catch (error) {
      console.error('❌ Export failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the export if this script is executed directly
if (require.main === module) {
  const exporter = new WordPressExporter();
  exporter.runExport();
}

module.exports = WordPressExporter;

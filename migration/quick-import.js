#!/usr/bin/env node

/**
 * Quick Data Import for WordPress Migration Demo
 * Imports sample data from CSV files to populate the database for export testing
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mdtstech_store',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Helper function to clean and format data
function cleanData(value) {
  if (!value || value === '-' || value === '') return null;
  return value.toString().trim();
}

function parsePrice(priceStr) {
  if (!priceStr || priceStr === '-') return 99.99;
  const cleaned = priceStr.replace(/[$,]/g, '');
  const price = parseFloat(cleaned);
  return isNaN(price) ? 99.99 : price;
}

function generateSKU(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 10) + '-' + Math.floor(Math.random() * 1000);
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Import sample data
async function importSampleData() {
  console.log('Starting quick data import...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create sample categories
    const categories = [
      { name: 'Phone Parts', slug: 'phone-parts', description: 'Replacement parts for mobile phones' },
      { name: 'iPhone Parts', slug: 'iphone-parts', description: 'Parts specifically for iPhone devices' },
      { name: 'Samsung Parts', slug: 'samsung-parts', description: 'Parts for Samsung Galaxy devices' },
      { name: 'LG Parts', slug: 'lg-parts', description: 'Parts for LG smartphones' },
      { name: 'Repair Tools', slug: 'repair-tools', description: 'Professional repair tools and equipment' },
      { name: 'Accessories', slug: 'accessories', description: 'Phone accessories and add-ons' }
    ];
    
    console.log('Creating categories...');
    const categoryMap = {};
    
    for (const cat of categories) {
      const result = await client.query(
        'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [cat.name, cat.slug, cat.description]
      );
      categoryMap[cat.name] = result.rows[0].id;
    }
    
    // Read and import products from CSV
    console.log('Reading product data...');
    const csvPath = path.join(__dirname, '../database/data/combinedmobilesentrix.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }
    
    const products = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Skip empty rows or navigation items
          if (!row.Col0 || row.Col0.includes('About Us') || row.Col0.includes('Blog')) {
            return;
          }
          
          const name = cleanData(row.Col0);
          const price = parsePrice(row.Col1);
          
          if (name && name.length > 5) {
            products.push({
              name: name,
              price: price,
              image_url: cleanData(row.Col7_SRC) || cleanData(row.Col6_SRC),
              product_url: cleanData(row.Col5_HREF)
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`Found ${products.length} products to import`);
    
    // Import products (limit to first 100 for demo)
    const productsToImport = products.slice(0, 100);
    let importedCount = 0;
    
    for (const product of productsToImport) {
      try {
        // Determine category based on product name
        let categoryId = categoryMap['Phone Parts']; // default
        
        if (product.name.toLowerCase().includes('iphone')) {
          categoryId = categoryMap['iPhone Parts'];
        } else if (product.name.toLowerCase().includes('samsung')) {
          categoryId = categoryMap['Samsung Parts'];
        } else if (product.name.toLowerCase().includes('lg')) {
          categoryId = categoryMap['LG Parts'];
        } else if (product.name.toLowerCase().includes('tool')) {
          categoryId = categoryMap['Repair Tools'];
        }
        
        const slug = generateSlug(product.name);
        const sku = generateSKU(product.name);
        
        // Insert product
        await client.query(
          `INSERT INTO products (
            name, slug, sku, description, price, stock_quantity,
            is_featured, is_new, image_url, brand, category_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            image_url = EXCLUDED.image_url,
            updated_at = CURRENT_TIMESTAMP`,
          [
            product.name,
            slug,
            sku,
            `${product.name} - High-quality replacement part`,
            product.price,
            Math.floor(Math.random() * 50) + 10, // Random stock 10-60
            Math.random() > 0.8, // 20% chance of being featured
            Math.random() > 0.9, // 10% chance of being new
            product.image_url,
            'MDTS',
            categoryId
          ]
        );
        
        importedCount++;
      } catch (error) {
        console.log(`Error importing product ${product.name}: ${error.message}`);
      }
    }
    
    // Create sample users
    console.log('Creating sample users...');
    const users = [
      {
        email: 'admin@midastechnical.com',
        first_name: 'Admin',
        last_name: 'User',
        is_admin: true
      },
      {
        email: 'customer1@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_admin: false
      },
      {
        email: 'customer2@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        is_admin: false
      }
    ];
    
    for (const user of users) {
      await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, is_admin)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [
          user.email,
          '$2b$10$dummy.hash.for.demo.purposes.only', // Dummy hash
          user.first_name,
          user.last_name,
          user.is_admin
        ]
      );
    }
    
    // Create sample orders
    console.log('Creating sample orders...');
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    
    for (let i = 1; i <= 10; i++) {
      const orderNumber = `ORD-${String(i).padStart(4, '0')}`;
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const total = (Math.random() * 200 + 50).toFixed(2);
      
      await client.query(
        `INSERT INTO orders (
          order_number, status, total_amount, payment_method, payment_status
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (order_number) DO NOTHING`,
        [orderNumber, status, total, 'stripe', 'paid']
      );
    }
    
    await client.query('COMMIT');
    
    console.log('✅ Sample data import completed successfully!');
    console.log(`📊 Imported: ${importedCount} products, ${categories.length} categories, ${users.length} users, 10 orders`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Main function
async function main() {
  try {
    await importSampleData();
    console.log('\n🚀 Ready to run data export!');
    console.log('Next step: Run "node export-data.js" to export data for WordPress');
  } catch (error) {
    console.error('Import process failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { importSampleData };

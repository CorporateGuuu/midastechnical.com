#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const csv = require('csv-parser');

// Database configuration
const dbName = 'midastechnical_store';
const connectionString = process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${dbName}`;

// Create database connection
const pool = new Pool({
  connectionString,
});

// Helper function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

// Helper function to extract price from string
function extractPrice(priceStr) {
  if (!priceStr || priceStr === '-') return 0;
  const match = priceStr.match(/\$?(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper function to determine category from product name
function categorizeProduct(productName) {
  const name = productName.toLowerCase();

  if (name.includes('iphone') || name.includes('apple')) {
    return 'iPhone Parts';
  } else if (name.includes('samsung') || name.includes('galaxy')) {
    return 'Samsung Parts';
  } else if (name.includes('ipad')) {
    return 'iPad Parts';
  } else if (name.includes('macbook')) {
    return 'MacBook Parts';
  } else if (name.includes('lcd') || name.includes('oled') || name.includes('screen') || name.includes('assembly')) {
    return 'LCD Screens';
  } else if (name.includes('battery')) {
    return 'Batteries';
  } else if (name.includes('charging port') || name.includes('charger')) {
    return 'Charging Ports';
  } else if (name.includes('camera')) {
    return 'Cameras';
  } else if (name.includes('speaker') || name.includes('earpiece')) {
    return 'Speakers';
  } else if (name.includes('tool') || name.includes('screwdriver') || name.includes('kit')) {
    return 'Repair Tools';
  }

  return 'iPhone Parts'; // Default category
}

// Helper function to generate SKU
function generateSKU(productName, index) {
  const prefix = 'MDTS';
  const category = categorizeProduct(productName);
  const categoryCode = {
    'iPhone Parts': 'IP',
    'Samsung Parts': 'SP',
    'iPad Parts': 'IPD',
    'MacBook Parts': 'MB',
    'LCD Screens': 'LCD',
    'Batteries': 'BAT',
    'Charging Ports': 'CP',
    'Cameras': 'CAM',
    'Speakers': 'SPK',
    'Repair Tools': 'RT'
  }[category] || 'IP';

  return `${prefix}-${categoryCode}-${String(index).padStart(4, '0')}`;
}

async function importProductData() {
  console.log('🚀 Starting product data import...');

  try {
    // Get category mappings
    const categoriesResult = await pool.query('SELECT id, name FROM categories');
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('📂 Available categories:', Object.keys(categoryMap));

    // Read and process CSV file
    const csvFilePath = path.join(__dirname, 'database', 'data', 'combinedmobilesentrix.csv');

    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    console.log('📄 Reading CSV file:', csvFilePath);

    const products = [];
    let rowIndex = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Skip empty rows or navigation items
          if (!row.Col0 || !row.Col1 || row.Col1 === '-' || row.Col0.includes('About Us') || row.Col0.includes('Blog')) {
            return;
          }

          const productName = row.Col0.trim();
          const priceStr = row.Col1.trim();
          const productUrl = row.Col5_HREF;
          const imageUrl = row.Col7_SRC;

          // Skip if essential data is missing
          if (!productName || !priceStr || priceStr === '-') {
            return;
          }

          const price = extractPrice(priceStr);
          if (price <= 0) return;

          const categoryName = categorizeProduct(productName);
          const categoryId = categoryMap[categoryName];

          if (!categoryId) {
            console.warn(`⚠️  Category not found for: ${categoryName}`);
            return;
          }

          const product = {
            name: productName,
            slug: createSlug(productName),
            sku: generateSKU(productName, rowIndex++),
            description: `High-quality ${productName.toLowerCase()} compatible with various device models. Professional grade replacement part.`,
            price: price,
            discount_percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0, // Random discount for some products
            stock_quantity: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
            is_featured: Math.random() > 0.9, // 10% chance of being featured
            is_new: Math.random() > 0.8, // 20% chance of being new
            image_url: imageUrl && imageUrl.startsWith('http') ? imageUrl : null,
            category_id: categoryId,
            brand: productName.includes('iPhone') || productName.includes('iPad') || productName.includes('MacBook') ? 'Apple' :
              productName.includes('Samsung') || productName.includes('Galaxy') ? 'Samsung' :
                productName.includes('LG') ? 'LG' : 'Generic'
          };

          products.push(product);
        })
        .on('end', async () => {
          try {
            console.log(`📊 Processed ${products.length} products from CSV`);

            // Insert products in batches
            const batchSize = 50;
            let insertedCount = 0;

            for (let i = 0; i < products.length; i += batchSize) {
              const batch = products.slice(i, i + batchSize);

              for (const product of batch) {
                try {
                  // Check if product with same SKU already exists
                  const existingProduct = await pool.query(
                    'SELECT id FROM products WHERE sku = $1',
                    [product.sku]
                  );

                  if (existingProduct.rows.length > 0) {
                    continue; // Skip if already exists
                  }

                  // Insert product
                  const insertResult = await pool.query(`
                    INSERT INTO products (
                      name, slug, sku, description, price, discount_percentage,
                      stock_quantity, is_featured, is_new, image_url, category_id, brand
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING id
                  `, [
                    product.name, product.slug, product.sku, product.description,
                    product.price, product.discount_percentage, product.stock_quantity,
                    product.is_featured, product.is_new, product.image_url,
                    product.category_id, product.brand
                  ]);

                  const productId = insertResult.rows[0].id;

                  // Add product image record if image URL exists
                  if (product.image_url) {
                    await pool.query(`
                      INSERT INTO product_images (product_id, image_url, is_primary, display_order)
                      VALUES ($1, $2, true, 0)
                    `, [productId, product.image_url]);
                  }

                  insertedCount++;
                } catch (error) {
                  console.warn(`⚠️  Failed to insert product: ${product.name}`, error.message);
                }
              }

              console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)} - Inserted: ${insertedCount}`);
            }

            // Get final statistics
            const stats = await pool.query(`
              SELECT
                COUNT(*) as total_products,
                COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_products,
                COUNT(CASE WHEN is_new = true THEN 1 END) as new_products,
                AVG(price) as avg_price,
                MIN(price) as min_price,
                MAX(price) as max_price
              FROM products
            `);

            const categoryStats = await pool.query(`
              SELECT c.name, COUNT(p.id) as product_count
              FROM categories c
              LEFT JOIN products p ON c.id = p.category_id
              GROUP BY c.id, c.name
              ORDER BY product_count DESC
            `);

            console.log('\n🎉 Product import completed successfully!');
            console.log('📊 Final Statistics:');
            console.log(`   Total Products: ${stats.rows[0].total_products}`);
            console.log(`   Featured Products: ${stats.rows[0].featured_products}`);
            console.log(`   New Products: ${stats.rows[0].new_products}`);
            console.log(`   Average Price: $${parseFloat(stats.rows[0].avg_price).toFixed(2)}`);
            console.log(`   Price Range: $${stats.rows[0].min_price} - $${stats.rows[0].max_price}`);

            console.log('\n📂 Products by Category:');
            categoryStats.rows.forEach(cat => {
              console.log(`   ${cat.name}: ${cat.product_count} products`);
            });

            resolve(insertedCount);
          } catch (error) {
            reject(error);
          } finally {
            // Close the pool connection
            await pool.end();
          }
        })
        .on('error', (error) => {
          pool.end().then(() => reject(error));
        });
    });

  } catch (error) {
    console.error('❌ Error importing product data:', error);
    await pool.end();
    throw error;
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importProductData()
    .then(count => {
      console.log(`\n✅ Successfully imported ${count} products`);
      console.log('🚀 Ready to start the application: npm run dev');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importProductData };

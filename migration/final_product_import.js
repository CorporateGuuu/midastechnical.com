#!/usr/bin/env node

/**
 * Final Product Import to reach 500+ products
 */

const { Pool } = require('pg');

const dbName = 'midastechnical_store';
const connectionString = process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${dbName}`;

const pool = new Pool({
  connectionString,
});

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

async function addProducts() {
  console.log('🚀 Final Product Import to reach 500+ products');
  console.log('=' .repeat(50));
  
  try {
    // Get current count
    const currentResult = await pool.query('SELECT COUNT(*) FROM products');
    const currentCount = parseInt(currentResult.rows[0].count);
    console.log(`📊 Current product count: ${currentCount}`);
    
    if (currentCount >= 500) {
      console.log('✅ Target already achieved!');
      return;
    }
    
    // Get category IDs
    const categories = await pool.query('SELECT id, name FROM categories');
    const categoryMap = {};
    categories.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    console.log(`📂 Available categories: ${Object.keys(categoryMap).join(', ')}`);
    
    // Define products to add
    const productsToAdd = [
      // iPhone Parts
      { name: 'iPhone 15 Pro Max LCD Screen Assembly', category: 'iPhone Parts', price: 299.99, brand: 'Apple' },
      { name: 'iPhone 15 Pro LCD Screen Assembly', category: 'iPhone Parts', price: 279.99, brand: 'Apple' },
      { name: 'iPhone 15 Plus LCD Screen Assembly', category: 'iPhone Parts', price: 259.99, brand: 'Apple' },
      { name: 'iPhone 15 LCD Screen Assembly', category: 'iPhone Parts', price: 239.99, brand: 'Apple' },
      { name: 'iPhone 14 Pro Max Battery', category: 'iPhone Parts', price: 59.99, brand: 'Apple' },
      { name: 'iPhone 14 Pro Battery', category: 'iPhone Parts', price: 54.99, brand: 'Apple' },
      { name: 'iPhone 14 Plus Battery', category: 'iPhone Parts', price: 49.99, brand: 'Apple' },
      { name: 'iPhone 14 Battery', category: 'iPhone Parts', price: 44.99, brand: 'Apple' },
      { name: 'iPhone 13 Pro Max Camera Module', category: 'iPhone Parts', price: 129.99, brand: 'Apple' },
      { name: 'iPhone 13 Pro Camera Module', category: 'iPhone Parts', price: 119.99, brand: 'Apple' },
      
      // Samsung Parts
      { name: 'Samsung Galaxy S24 Ultra LCD Screen', category: 'Samsung Parts', price: 249.99, brand: 'Samsung' },
      { name: 'Samsung Galaxy S24+ LCD Screen', category: 'Samsung Parts', price: 229.99, brand: 'Samsung' },
      { name: 'Samsung Galaxy S24 LCD Screen', category: 'Samsung Parts', price: 209.99, brand: 'Samsung' },
      { name: 'Samsung Galaxy S23 Ultra Battery', category: 'Samsung Parts', price: 64.99, brand: 'Samsung' },
      { name: 'Samsung Galaxy S23+ Battery', category: 'Samsung Parts', price: 59.99, brand: 'Samsung' },
      { name: 'Samsung Galaxy S23 Battery', category: 'Samsung Parts', price: 54.99, brand: 'Samsung' },
      { name: 'Samsung Galaxy S24 Ultra Camera Module', category: 'Samsung Parts', price: 139.99, brand: 'Samsung' },
      { name: 'Samsung Galaxy S24+ Camera Module', category: 'Samsung Parts', price: 129.99, brand: 'Samsung' },
      { name: 'Samsung Galaxy S24 Camera Module', category: 'Samsung Parts', price: 119.99, brand: 'Samsung' },
      { name: 'Samsung Galaxy S23 Ultra Charging Port', category: 'Samsung Parts', price: 39.99, brand: 'Samsung' },
      
      // LCD Screens
      { name: 'Universal LCD Screen 5.5 inch', category: 'LCD Screens', price: 89.99, brand: 'Generic' },
      { name: 'Universal LCD Screen 6.1 inch', category: 'LCD Screens', price: 99.99, brand: 'Generic' },
      { name: 'Universal LCD Screen 6.7 inch', category: 'LCD Screens', price: 109.99, brand: 'Generic' },
      { name: 'OLED Display 5.8 inch', category: 'LCD Screens', price: 149.99, brand: 'Generic' },
      { name: 'OLED Display 6.1 inch', category: 'LCD Screens', price: 159.99, brand: 'Generic' },
      { name: 'OLED Display 6.7 inch', category: 'LCD Screens', price: 169.99, brand: 'Generic' },
      { name: 'LCD Touch Screen Digitizer 5.5 inch', category: 'LCD Screens', price: 79.99, brand: 'Generic' },
      { name: 'LCD Touch Screen Digitizer 6.1 inch', category: 'LCD Screens', price: 89.99, brand: 'Generic' },
      { name: 'LCD Touch Screen Digitizer 6.7 inch', category: 'LCD Screens', price: 99.99, brand: 'Generic' },
      { name: 'Curved OLED Display 6.8 inch', category: 'LCD Screens', price: 199.99, brand: 'Generic' },
      
      // Batteries
      { name: 'High Capacity Battery 3000mAh', category: 'Batteries', price: 39.99, brand: 'Generic' },
      { name: 'High Capacity Battery 4000mAh', category: 'Batteries', price: 49.99, brand: 'Generic' },
      { name: 'High Capacity Battery 5000mAh', category: 'Batteries', price: 59.99, brand: 'Generic' },
      { name: 'Wireless Charging Battery 3500mAh', category: 'Batteries', price: 54.99, brand: 'Generic' },
      { name: 'Fast Charging Battery 4500mAh', category: 'Batteries', price: 64.99, brand: 'Generic' },
      { name: 'Extended Life Battery 3200mAh', category: 'Batteries', price: 44.99, brand: 'Generic' },
      { name: 'Premium Battery 3800mAh', category: 'Batteries', price: 49.99, brand: 'Generic' },
      { name: 'Long Life Battery 4200mAh', category: 'Batteries', price: 54.99, brand: 'Generic' },
      { name: 'Ultra Capacity Battery 5500mAh', category: 'Batteries', price: 69.99, brand: 'Generic' },
      { name: 'Professional Battery 4800mAh', category: 'Batteries', price: 59.99, brand: 'Generic' },
      
      // Cameras
      { name: 'Front Camera 12MP', category: 'Cameras', price: 79.99, brand: 'Generic' },
      { name: 'Rear Camera 48MP', category: 'Cameras', price: 119.99, brand: 'Generic' },
      { name: 'Ultra Wide Camera 12MP', category: 'Cameras', price: 99.99, brand: 'Generic' },
      { name: 'Telephoto Camera 12MP', category: 'Cameras', price: 129.99, brand: 'Generic' },
      { name: 'Macro Camera 5MP', category: 'Cameras', price: 69.99, brand: 'Generic' },
      { name: 'Depth Camera 2MP', category: 'Cameras', price: 59.99, brand: 'Generic' },
      { name: 'Night Vision Camera 8MP', category: 'Cameras', price: 89.99, brand: 'Generic' },
      { name: 'Stabilized Camera 16MP', category: 'Cameras', price: 109.99, brand: 'Generic' },
      { name: 'Professional Camera 64MP', category: 'Cameras', price: 149.99, brand: 'Generic' },
      { name: 'Dual Camera Module', category: 'Cameras', price: 159.99, brand: 'Generic' },
      
      // Charging Ports
      { name: 'USB-C Charging Port Assembly', category: 'Charging Ports', price: 29.99, brand: 'Generic' },
      { name: 'Lightning Charging Port Assembly', category: 'Charging Ports', price: 34.99, brand: 'Generic' },
      { name: 'Micro USB Charging Port', category: 'Charging Ports', price: 19.99, brand: 'Generic' },
      { name: 'Wireless Charging Coil', category: 'Charging Ports', price: 24.99, brand: 'Generic' },
      { name: 'Fast Charging Port USB-C', category: 'Charging Ports', price: 39.99, brand: 'Generic' },
      { name: 'Waterproof Charging Port', category: 'Charging Ports', price: 44.99, brand: 'Generic' },
      { name: 'Magnetic Charging Port', category: 'Charging Ports', price: 49.99, brand: 'Generic' },
      { name: 'Dual Port Charging Assembly', category: 'Charging Ports', price: 54.99, brand: 'Generic' },
      { name: 'Quick Charge 3.0 Port', category: 'Charging Ports', price: 42.99, brand: 'Generic' },
      { name: 'Power Delivery Charging Port', category: 'Charging Ports', price: 47.99, brand: 'Generic' },
      
      // Speakers
      { name: 'Loud Speaker Assembly', category: 'Speakers', price: 24.99, brand: 'Generic' },
      { name: 'Earpiece Speaker', category: 'Speakers', price: 19.99, brand: 'Generic' },
      { name: 'Stereo Speaker Set', category: 'Speakers', price: 39.99, brand: 'Generic' },
      { name: 'Bass Speaker Module', category: 'Speakers', price: 29.99, brand: 'Generic' },
      { name: 'High Fidelity Speaker', category: 'Speakers', price: 34.99, brand: 'Generic' },
      { name: 'Waterproof Speaker', category: 'Speakers', price: 44.99, brand: 'Generic' },
      { name: 'Dual Speaker System', category: 'Speakers', price: 49.99, brand: 'Generic' },
      { name: 'Professional Audio Speaker', category: 'Speakers', price: 54.99, brand: 'Generic' },
      { name: 'Noise Cancelling Speaker', category: 'Speakers', price: 59.99, brand: 'Generic' },
      { name: 'Premium Sound Speaker', category: 'Speakers', price: 64.99, brand: 'Generic' },
      
      // Repair Tools
      { name: 'Complete Repair Tool Kit', category: 'Repair Tools', price: 89.99, brand: 'Professional Tools' },
      { name: 'Precision Screwdriver Set 32-in-1', category: 'Repair Tools', price: 49.99, brand: 'Professional Tools' },
      { name: 'Opening Tool Set', category: 'Repair Tools', price: 29.99, brand: 'Professional Tools' },
      { name: 'Suction Cup Set', category: 'Repair Tools', price: 19.99, brand: 'Professional Tools' },
      { name: 'Spudger Tool Set', category: 'Repair Tools', price: 24.99, brand: 'Professional Tools' },
      { name: 'Tweezers Precision Set', category: 'Repair Tools', price: 34.99, brand: 'Professional Tools' },
      { name: 'Heat Gun Professional', category: 'Repair Tools', price: 79.99, brand: 'Professional Tools' },
      { name: 'Soldering Station', category: 'Repair Tools', price: 149.99, brand: 'Professional Tools' },
      { name: 'Multimeter Digital', category: 'Repair Tools', price: 59.99, brand: 'Professional Tools' },
      { name: 'Magnifying Lamp LED', category: 'Repair Tools', price: 69.99, brand: 'Professional Tools' }
    ];
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const product of productsToAdd) {
      try {
        const categoryId = categoryMap[product.category];
        if (!categoryId) {
          console.warn(`   ⚠️  Category not found: ${product.category}`);
          skippedCount++;
          continue;
        }
        
        const slug = generateSlug(product.name);
        const sku = `MDTS-${Date.now().toString().slice(-6)}-${addedCount.toString().padStart(3, '0')}`;
        
        // Check if product already exists
        const existing = await pool.query('SELECT id FROM products WHERE slug = $1 OR sku = $2', [slug, sku]);
        if (existing.rows.length > 0) {
          skippedCount++;
          continue;
        }
        
        const description = `High-quality ${product.name.toLowerCase()} replacement part. Professional grade component designed for optimal performance and durability. Perfect for repair shops and DIY enthusiasts.`;
        
        await pool.query(`
          INSERT INTO products (
            name, slug, sku, price, category_id, brand, description, 
            stock_quantity, is_featured, is_new
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          product.name,
          slug,
          sku,
          product.price,
          categoryId,
          product.brand,
          description,
          Math.floor(Math.random() * 50) + 20, // Random stock 20-70
          Math.random() > 0.95, // 5% chance of being featured
          Math.random() > 0.8    // 20% chance of being new
        ]);
        
        addedCount++;
        
        if (addedCount % 10 === 0) {
          console.log(`   📦 Added ${addedCount} products...`);
        }
        
      } catch (error) {
        console.warn(`   ⚠️  Failed to add product: ${product.name} - ${error.message}`);
        skippedCount++;
      }
    }
    
    // Get final count
    const finalResult = await pool.query('SELECT COUNT(*) FROM products');
    const finalCount = parseInt(finalResult.rows[0].count);
    
    console.log('\n🎉 FINAL PRODUCT IMPORT COMPLETE');
    console.log('=' .repeat(50));
    console.log(`📊 Products added: ${addedCount}`);
    console.log(`📊 Products skipped: ${skippedCount}`);
    console.log(`📊 Final product count: ${finalCount}`);
    console.log(`🎯 Target achievement: ${finalCount >= 500 ? '✅ ACHIEVED' : '⚠️ IN PROGRESS'}`);
    
    if (finalCount >= 500) {
      console.log('\n🚀 SUCCESS! Your product database now has 500+ products!');
      console.log('🔗 Verify at: http://localhost:3002/products');
    } else {
      console.log(`\n⚠️  Still need ${500 - finalCount} more products to reach target.`);
    }
    
  } catch (error) {
    console.error('❌ Error adding products:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addProducts().catch(error => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
}

module.exports = { addProducts };

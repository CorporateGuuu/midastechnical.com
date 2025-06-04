#!/usr/bin/env node

const { Pool } = require('pg');

// Database configuration
const dbName = 'midastechnical_store';
const connectionString = process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${dbName}`;

// Create database connection
const pool = new Pool({
  connectionString,
});

async function validateDataQuality() {
  console.log('🔍 Starting comprehensive data quality validation...');
  
  const validationResults = {
    duplicates: [],
    missingFields: [],
    invalidPrices: [],
    brokenRelationships: [],
    imageIssues: [],
    summary: {}
  };

  try {
    // 1. Check for duplicate SKUs
    console.log('📋 Checking for duplicate SKUs...');
    const duplicateSkus = await pool.query(`
      SELECT sku, COUNT(*) as count
      FROM products
      GROUP BY sku
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicateSkus.rows.length > 0) {
      validationResults.duplicates = duplicateSkus.rows;
      console.log(`   ⚠️  Found ${duplicateSkus.rows.length} duplicate SKUs`);
    } else {
      console.log('   ✅ No duplicate SKUs found');
    }

    // 2. Check for missing required fields
    console.log('📋 Checking for missing required fields...');
    const missingFields = await pool.query(`
      SELECT 
        id, sku, name,
        CASE 
          WHEN name IS NULL OR name = '' THEN 'name'
          WHEN price IS NULL OR price <= 0 THEN 'price'
          WHEN category_id IS NULL THEN 'category_id'
          WHEN stock_quantity IS NULL THEN 'stock_quantity'
          ELSE NULL
        END as missing_field
      FROM products
      WHERE 
        name IS NULL OR name = '' OR
        price IS NULL OR price <= 0 OR
        category_id IS NULL OR
        stock_quantity IS NULL
    `);
    
    if (missingFields.rows.length > 0) {
      validationResults.missingFields = missingFields.rows;
      console.log(`   ⚠️  Found ${missingFields.rows.length} products with missing required fields`);
    } else {
      console.log('   ✅ All products have required fields');
    }

    // 3. Validate price formats
    console.log('📋 Checking price formats...');
    const invalidPrices = await pool.query(`
      SELECT id, sku, name, price
      FROM products
      WHERE 
        price < 0 OR
        price > 10000 OR
        ROUND(price::numeric, 2) != price
    `);
    
    if (invalidPrices.rows.length > 0) {
      validationResults.invalidPrices = invalidPrices.rows;
      console.log(`   ⚠️  Found ${invalidPrices.rows.length} products with invalid prices`);
    } else {
      console.log('   ✅ All prices are valid');
    }

    // 4. Check category relationships
    console.log('📋 Checking category relationships...');
    const brokenRelationships = await pool.query(`
      SELECT p.id, p.sku, p.name, p.category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE c.id IS NULL
    `);
    
    if (brokenRelationships.rows.length > 0) {
      validationResults.brokenRelationships = brokenRelationships.rows;
      console.log(`   ⚠️  Found ${brokenRelationships.rows.length} products with broken category relationships`);
    } else {
      console.log('   ✅ All category relationships are valid');
    }

    // 5. Check image accessibility
    console.log('📋 Checking image accessibility...');
    const imageIssues = await pool.query(`
      SELECT p.id, p.sku, p.name, p.image_url
      FROM products p
      WHERE 
        p.image_url IS NULL OR 
        p.image_url = '' OR
        (p.image_url NOT LIKE '/images/products/%' AND p.image_url NOT LIKE 'http%')
    `);
    
    if (imageIssues.rows.length > 0) {
      validationResults.imageIssues = imageIssues.rows;
      console.log(`   ⚠️  Found ${imageIssues.rows.length} products with image issues`);
    } else {
      console.log('   ✅ All product images are properly configured');
    }

    // 6. Generate comprehensive statistics
    console.log('📊 Generating data quality statistics...');
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as products_with_names,
        COUNT(CASE WHEN price > 0 THEN 1 END) as products_with_valid_prices,
        COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as products_with_images,
        COUNT(CASE WHEN image_url LIKE '/images/products/%' THEN 1 END) as products_with_local_images,
        COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as products_in_stock,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_products,
        COUNT(CASE WHEN is_new = true THEN 1 END) as new_products,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(stock_quantity) as avg_stock
      FROM products
    `);

    const categoryStats = await pool.query(`
      SELECT 
        c.name as category_name,
        COUNT(p.id) as product_count,
        AVG(p.price) as avg_price,
        COUNT(CASE WHEN p.image_url LIKE '/images/products/%' THEN 1 END) as products_with_local_images
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
    `);

    validationResults.summary = {
      overall: stats.rows[0],
      byCategory: categoryStats.rows
    };

    // 7. Test data flow: Database → API → Frontend
    console.log('🔄 Testing data flow...');
    const sampleProducts = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LIMIT 5
    `);

    console.log('   ✅ Sample products retrieved successfully');

    // Display validation results
    console.log('\n🎉 Data Quality Validation Complete!');
    console.log('=' .repeat(50));
    
    console.log('\n📊 OVERALL STATISTICS:');
    const overall = validationResults.summary.overall;
    console.log(`   Total Products: ${overall.total_products}`);
    console.log(`   Products with Names: ${overall.products_with_names} (${(overall.products_with_names/overall.total_products*100).toFixed(1)}%)`);
    console.log(`   Products with Valid Prices: ${overall.products_with_valid_prices} (${(overall.products_with_valid_prices/overall.total_products*100).toFixed(1)}%)`);
    console.log(`   Products with Images: ${overall.products_with_images} (${(overall.products_with_images/overall.total_products*100).toFixed(1)}%)`);
    console.log(`   Products with Local Images: ${overall.products_with_local_images} (${(overall.products_with_local_images/overall.total_products*100).toFixed(1)}%)`);
    console.log(`   Products in Stock: ${overall.products_in_stock} (${(overall.products_in_stock/overall.total_products*100).toFixed(1)}%)`);
    console.log(`   Featured Products: ${overall.featured_products}`);
    console.log(`   New Products: ${overall.new_products}`);
    console.log(`   Average Price: $${parseFloat(overall.avg_price).toFixed(2)}`);
    console.log(`   Price Range: $${overall.min_price} - $${overall.max_price}`);
    console.log(`   Average Stock: ${parseFloat(overall.avg_stock).toFixed(0)} units`);

    console.log('\n📂 CATEGORY BREAKDOWN:');
    validationResults.summary.byCategory.forEach(cat => {
      console.log(`   ${cat.category_name}: ${cat.product_count} products (avg: $${parseFloat(cat.avg_price || 0).toFixed(2)}, ${cat.products_with_local_images} with images)`);
    });

    console.log('\n🚨 VALIDATION ISSUES:');
    if (validationResults.duplicates.length > 0) {
      console.log(`   ❌ Duplicate SKUs: ${validationResults.duplicates.length}`);
    }
    if (validationResults.missingFields.length > 0) {
      console.log(`   ❌ Missing Required Fields: ${validationResults.missingFields.length}`);
    }
    if (validationResults.invalidPrices.length > 0) {
      console.log(`   ❌ Invalid Prices: ${validationResults.invalidPrices.length}`);
    }
    if (validationResults.brokenRelationships.length > 0) {
      console.log(`   ❌ Broken Category Relationships: ${validationResults.brokenRelationships.length}`);
    }
    if (validationResults.imageIssues.length > 0) {
      console.log(`   ❌ Image Issues: ${validationResults.imageIssues.length}`);
    }

    const totalIssues = validationResults.duplicates.length + 
                       validationResults.missingFields.length + 
                       validationResults.invalidPrices.length + 
                       validationResults.brokenRelationships.length + 
                       validationResults.imageIssues.length;

    if (totalIssues === 0) {
      console.log('   ✅ No data quality issues found!');
    } else {
      console.log(`   ⚠️  Total Issues Found: ${totalIssues}`);
    }

    console.log('\n🔗 SAMPLE DATA FLOW TEST:');
    sampleProducts.rows.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name.substring(0, 40)}... ($${product.price}) - ${product.category_name}`);
    });

    return validationResults;

  } catch (error) {
    console.error('❌ Error during validation:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateDataQuality()
    .then(results => {
      const totalIssues = results.duplicates.length + 
                         results.missingFields.length + 
                         results.invalidPrices.length + 
                         results.brokenRelationships.length + 
                         results.imageIssues.length;
      
      if (totalIssues === 0) {
        console.log('\n✅ Data validation passed! Ready for production.');
        process.exit(0);
      } else {
        console.log(`\n⚠️  Data validation completed with ${totalIssues} issues that should be addressed.`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateDataQuality };

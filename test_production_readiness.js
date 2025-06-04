#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbName = 'midastechnical_store';
const connectionString = process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${dbName}`;

// Create database connection
const pool = new Pool({
  connectionString,
});

async function testProductionReadiness() {
  console.log('🧪 Testing Production Readiness for midastechnical.com...');
  console.log('=' .repeat(60));

  const testResults = {
    database: { passed: 0, total: 0, issues: [] },
    products: { passed: 0, total: 0, issues: [] },
    images: { passed: 0, total: 0, issues: [] },
    content: { passed: 0, total: 0, issues: [] },
    automation: { passed: 0, total: 0, issues: [] },
    files: { passed: 0, total: 0, issues: [] }
  };

  try {
    // 1. Database Tests
    console.log('\n🗄️  DATABASE TESTS');
    console.log('-' .repeat(30));

    // Test 1.1: Database connection
    testResults.database.total++;
    try {
      const result = await pool.query('SELECT NOW() as current_time');
      console.log('   ✅ Database connection successful');
      testResults.database.passed++;
    } catch (error) {
      console.log('   ❌ Database connection failed');
      testResults.database.issues.push('Database connection failed');
    }

    // Test 1.2: Required tables exist
    testResults.database.total++;
    try {
      const tables = await pool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      const requiredTables = ['products', 'categories', 'product_images', 'users', 'orders', 'content_pages'];
      const existingTables = tables.rows.map(row => row.table_name);
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length === 0) {
        console.log(`   ✅ All required tables exist (${existingTables.length} total)`);
        testResults.database.passed++;
      } else {
        console.log(`   ❌ Missing tables: ${missingTables.join(', ')}`);
        testResults.database.issues.push(`Missing tables: ${missingTables.join(', ')}`);
      }
    } catch (error) {
      console.log('   ❌ Table verification failed');
      testResults.database.issues.push('Table verification failed');
    }

    // 2. Product Data Tests
    console.log('\n📦 PRODUCT DATA TESTS');
    console.log('-' .repeat(30));

    // Test 2.1: Product count
    testResults.products.total++;
    try {
      const productCount = await pool.query('SELECT COUNT(*) FROM products');
      const count = parseInt(productCount.rows[0].count);
      if (count >= 100) {
        console.log(`   ✅ Sufficient products in database (${count} products)`);
        testResults.products.passed++;
      } else {
        console.log(`   ❌ Insufficient products (${count} < 100 required)`);
        testResults.products.issues.push(`Only ${count} products (minimum 100 required)`);
      }
    } catch (error) {
      console.log('   ❌ Product count check failed');
      testResults.products.issues.push('Product count check failed');
    }

    // Test 2.2: Product data quality
    testResults.products.total++;
    try {
      const qualityCheck = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as with_names,
          COUNT(CASE WHEN price > 0 THEN 1 END) as with_prices,
          COUNT(CASE WHEN sku IS NOT NULL AND sku != '' THEN 1 END) as with_skus
        FROM products
      `);
      
      const stats = qualityCheck.rows[0];
      const qualityScore = ((parseInt(stats.with_names) + parseInt(stats.with_prices) + parseInt(stats.with_skus)) / (parseInt(stats.total) * 3)) * 100;
      
      if (qualityScore >= 95) {
        console.log(`   ✅ Product data quality excellent (${qualityScore.toFixed(1)}%)`);
        testResults.products.passed++;
      } else {
        console.log(`   ❌ Product data quality issues (${qualityScore.toFixed(1)}% < 95% required)`);
        testResults.products.issues.push(`Data quality ${qualityScore.toFixed(1)}% (95% required)`);
      }
    } catch (error) {
      console.log('   ❌ Product quality check failed');
      testResults.products.issues.push('Product quality check failed');
    }

    // Test 2.3: Category distribution
    testResults.products.total++;
    try {
      const categoryStats = await pool.query(`
        SELECT c.name, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id, c.name
        HAVING COUNT(p.id) > 0
        ORDER BY product_count DESC
      `);
      
      if (categoryStats.rows.length >= 5) {
        console.log(`   ✅ Good category distribution (${categoryStats.rows.length} categories with products)`);
        testResults.products.passed++;
      } else {
        console.log(`   ❌ Poor category distribution (${categoryStats.rows.length} < 5 categories)`);
        testResults.products.issues.push(`Only ${categoryStats.rows.length} categories with products`);
      }
    } catch (error) {
      console.log('   ❌ Category distribution check failed');
      testResults.products.issues.push('Category distribution check failed');
    }

    // 3. Image Tests
    console.log('\n🖼️  IMAGE TESTS');
    console.log('-' .repeat(30));

    // Test 3.1: Image directory structure
    testResults.images.total++;
    const imageDir = path.join(__dirname, 'public', 'images', 'products');
    if (fs.existsSync(imageDir)) {
      const categories = fs.readdirSync(imageDir);
      if (categories.length >= 3) {
        console.log(`   ✅ Image directory structure exists (${categories.length} category folders)`);
        testResults.images.passed++;
      } else {
        console.log(`   ❌ Insufficient image categories (${categories.length} < 3)`);
        testResults.images.issues.push(`Only ${categories.length} image category folders`);
      }
    } else {
      console.log('   ❌ Image directory does not exist');
      testResults.images.issues.push('Image directory missing');
    }

    // Test 3.2: Local image count
    testResults.images.total++;
    try {
      const localImages = await pool.query(`
        SELECT COUNT(*) FROM products 
        WHERE image_url LIKE '/images/products/%'
      `);
      const localCount = parseInt(localImages.rows[0].count);
      
      if (localCount >= 50) {
        console.log(`   ✅ Sufficient local images (${localCount} products with local images)`);
        testResults.images.passed++;
      } else {
        console.log(`   ❌ Insufficient local images (${localCount} < 50 required)`);
        testResults.images.issues.push(`Only ${localCount} products with local images`);
      }
    } catch (error) {
      console.log('   ❌ Local image count check failed');
      testResults.images.issues.push('Local image count check failed');
    }

    // 4. Content Tests
    console.log('\n📝 CONTENT TESTS');
    console.log('-' .repeat(30));

    // Test 4.1: Content pages
    testResults.content.total++;
    try {
      const contentCount = await pool.query('SELECT COUNT(*) FROM content_pages WHERE published = true');
      const count = parseInt(contentCount.rows[0].count);
      
      if (count >= 5) {
        console.log(`   ✅ Sufficient content pages (${count} published pages)`);
        testResults.content.passed++;
      } else {
        console.log(`   ❌ Insufficient content pages (${count} < 5 required)`);
        testResults.content.issues.push(`Only ${count} published content pages`);
      }
    } catch (error) {
      console.log('   ❌ Content pages check failed');
      testResults.content.issues.push('Content pages check failed');
    }

    // Test 4.2: Product category content
    testResults.content.total++;
    try {
      const categoryContent = await pool.query('SELECT COUNT(*) FROM product_content');
      const count = parseInt(categoryContent.rows[0].count);
      
      if (count >= 5) {
        console.log(`   ✅ Category content available (${count} category descriptions)`);
        testResults.content.passed++;
      } else {
        console.log(`   ❌ Insufficient category content (${count} < 5 required)`);
        testResults.content.issues.push(`Only ${count} category descriptions`);
      }
    } catch (error) {
      console.log('   ❌ Category content check failed');
      testResults.content.issues.push('Category content check failed');
    }

    // 5. Automation Tests
    console.log('\n🤖 AUTOMATION TESTS');
    console.log('-' .repeat(30));

    // Test 5.1: Scheduled tasks
    testResults.automation.total++;
    try {
      const taskCount = await pool.query('SELECT COUNT(*) FROM scheduled_tasks WHERE enabled = true');
      const count = parseInt(taskCount.rows[0].count);
      
      if (count >= 5) {
        console.log(`   ✅ Automation tasks configured (${count} enabled tasks)`);
        testResults.automation.passed++;
      } else {
        console.log(`   ❌ Insufficient automation tasks (${count} < 5 required)`);
        testResults.automation.issues.push(`Only ${count} automation tasks`);
      }
    } catch (error) {
      console.log('   ❌ Automation tasks check failed');
      testResults.automation.issues.push('Automation tasks check failed');
    }

    // Test 5.2: Backup system
    testResults.automation.total++;
    const backupScript = path.join(__dirname, 'scripts', 'backup.sh');
    if (fs.existsSync(backupScript)) {
      console.log('   ✅ Backup system configured');
      testResults.automation.passed++;
    } else {
      console.log('   ❌ Backup system not configured');
      testResults.automation.issues.push('Backup script missing');
    }

    // 6. File Structure Tests
    console.log('\n📁 FILE STRUCTURE TESTS');
    console.log('-' .repeat(30));

    // Test 6.1: Required files
    testResults.files.total++;
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'lib/db.js',
      'lib/supabase.js',
      'pages/index.js',
      'pages/api/products/index.js'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
    
    if (missingFiles.length === 0) {
      console.log(`   ✅ All required files present (${requiredFiles.length} files)`);
      testResults.files.passed++;
    } else {
      console.log(`   ❌ Missing files: ${missingFiles.join(', ')}`);
      testResults.files.issues.push(`Missing files: ${missingFiles.join(', ')}`);
    }

    // Test 6.2: Configuration files
    testResults.files.total++;
    const configFiles = [
      '.env.example',
      'netlify.toml',
      'public/manifest.json'
    ];
    
    const missingConfigs = configFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
    
    if (missingConfigs.length === 0) {
      console.log(`   ✅ Configuration files present (${configFiles.length} files)`);
      testResults.files.passed++;
    } else {
      console.log(`   ❌ Missing config files: ${missingConfigs.join(', ')}`);
      testResults.files.issues.push(`Missing config files: ${missingConfigs.join(', ')}`);
    }

    // Calculate overall results
    const totalTests = Object.values(testResults).reduce((sum, category) => sum + category.total, 0);
    const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0);
    const totalIssues = Object.values(testResults).reduce((sum, category) => sum + category.issues.length, 0);
    const successRate = (totalPassed / totalTests) * 100;

    // Display final results
    console.log('\n🎉 PRODUCTION READINESS ASSESSMENT');
    console.log('=' .repeat(60));
    
    console.log('\n📊 TEST SUMMARY:');
    Object.entries(testResults).forEach(([category, results]) => {
      const rate = (results.passed / results.total) * 100;
      const status = rate === 100 ? '✅' : rate >= 80 ? '⚠️' : '❌';
      console.log(`   ${status} ${category.toUpperCase()}: ${results.passed}/${results.total} (${rate.toFixed(1)}%)`);
    });

    console.log(`\n🎯 OVERALL SCORE: ${totalPassed}/${totalTests} (${successRate.toFixed(1)}%)`);

    if (successRate >= 90) {
      console.log('\n🚀 STATUS: PRODUCTION READY!');
      console.log('   Your e-commerce platform is ready for launch.');
    } else if (successRate >= 80) {
      console.log('\n⚠️  STATUS: NEARLY READY');
      console.log('   Address the remaining issues before production deployment.');
    } else {
      console.log('\n❌ STATUS: NOT READY');
      console.log('   Significant issues need to be resolved before launch.');
    }

    if (totalIssues > 0) {
      console.log('\n🚨 ISSUES TO ADDRESS:');
      Object.entries(testResults).forEach(([category, results]) => {
        if (results.issues.length > 0) {
          console.log(`\n   ${category.toUpperCase()}:`);
          results.issues.forEach(issue => console.log(`     • ${issue}`));
        }
      });
    }

    console.log('\n🔗 NEXT STEPS:');
    console.log('   1. Start development server: npm run dev');
    console.log('   2. Test product catalog: http://localhost:3000/products');
    console.log('   3. Test admin panel: http://localhost:3000/admin');
    console.log('   4. Configure production environment variables');
    console.log('   5. Deploy to production hosting');

    return {
      totalTests,
      totalPassed,
      successRate,
      issues: totalIssues,
      ready: successRate >= 90
    };

  } catch (error) {
    console.error('❌ Error during production readiness test:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testProductionReadiness()
    .then(results => {
      if (results.ready) {
        console.log('\n✅ Production readiness test PASSED!');
        process.exit(0);
      } else {
        console.log(`\n⚠️  Production readiness test completed with ${results.issues} issues.`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Production readiness test FAILED:', error);
      process.exit(1);
    });
}

module.exports = { testProductionReadiness };

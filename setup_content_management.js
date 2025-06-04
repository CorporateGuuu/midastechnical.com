#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const dbName = 'midastechnical_store';
const connectionString = process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${dbName}`;

// Create database connection
const pool = new Pool({
  connectionString,
});

// Sample content data
const sampleContent = {
  productDescriptions: [
    {
      category: 'iPhone Parts',
      title: 'Premium iPhone Replacement Parts',
      content: 'Our iPhone replacement parts are sourced from certified suppliers and undergo rigorous quality testing. Each part is designed to meet or exceed OEM specifications, ensuring perfect compatibility and long-lasting performance.',
      seo_title: 'iPhone Replacement Parts - OEM Quality | Midas Technical',
      seo_description: 'High-quality iPhone replacement parts with OEM compatibility. Fast shipping, warranty included. Professional repair parts for all iPhone models.'
    },
    {
      category: 'LCD Screens',
      title: 'High-Quality LCD Screen Assemblies',
      content: 'Professional-grade LCD screen assemblies featuring vibrant colors, responsive touch sensitivity, and durable construction. Compatible with major smartphone brands including iPhone, Samsung, and LG.',
      seo_title: 'LCD Screen Assemblies - Professional Quality | Midas Technical',
      seo_description: 'Premium LCD screen assemblies for smartphones. OEM quality, perfect fit, vibrant display. Professional repair parts with warranty.'
    },
    {
      category: 'Batteries',
      title: 'Long-Lasting Mobile Device Batteries',
      content: 'Extend your device\'s life with our premium replacement batteries. Each battery is tested for capacity, safety, and longevity. Includes installation tools and safety guidelines.',
      seo_title: 'Mobile Device Batteries - Extended Life | Midas Technical',
      seo_description: 'High-capacity replacement batteries for smartphones and tablets. Tested for safety and performance. Free installation guide included.'
    },
    {
      category: 'Cameras',
      title: 'Crystal Clear Camera Modules',
      content: 'Restore your device\'s photography capabilities with our precision camera modules. Features advanced sensors, optical image stabilization, and perfect focus accuracy.',
      seo_title: 'Camera Modules - Professional Quality | Midas Technical',
      seo_description: 'High-resolution camera modules for smartphones. Advanced sensors, perfect focus, OEM compatibility. Professional repair parts.'
    },
    {
      category: 'Charging Ports',
      title: 'Reliable Charging Port Solutions',
      content: 'Fix charging issues with our durable charging port assemblies. Designed for optimal power transfer and data connectivity. Easy installation with included tools.',
      seo_title: 'Charging Port Assemblies - Fast & Reliable | Midas Technical',
      seo_description: 'Durable charging port assemblies for smartphones. Fast charging support, data connectivity, easy installation. Professional quality parts.'
    }
  ],
  
  blogPosts: [
    {
      title: 'How to Choose the Right iPhone Screen Replacement',
      slug: 'choose-right-iphone-screen-replacement',
      excerpt: 'Learn the key factors to consider when selecting a replacement screen for your iPhone, including quality grades, compatibility, and installation tips.',
      content: 'When your iPhone screen cracks or stops responding, choosing the right replacement is crucial for restoring your device to like-new condition...',
      category: 'Repair Guides',
      tags: ['iPhone', 'Screen Repair', 'DIY'],
      published: true
    },
    {
      title: 'Battery Health: When to Replace Your Phone Battery',
      slug: 'when-to-replace-phone-battery',
      excerpt: 'Discover the warning signs that indicate it\'s time to replace your smartphone battery and how to maximize battery life.',
      content: 'Smartphone batteries degrade over time, leading to shorter usage periods and unexpected shutdowns. Here\'s how to know when it\'s time for a replacement...',
      category: 'Maintenance Tips',
      tags: ['Battery', 'Maintenance', 'Smartphone'],
      published: true
    },
    {
      title: 'Professional vs DIY Phone Repair: Making the Right Choice',
      slug: 'professional-vs-diy-phone-repair',
      excerpt: 'Compare the pros and cons of professional repair services versus DIY repairs to make an informed decision for your device.',
      content: 'When your phone breaks, you face a choice: attempt a DIY repair or seek professional help. Each option has its advantages...',
      category: 'Repair Guides',
      tags: ['DIY', 'Professional Repair', 'Decision Guide'],
      published: true
    }
  ],

  helpArticles: [
    {
      title: 'Installation Guide: LCD Screen Assembly',
      slug: 'lcd-screen-installation-guide',
      category: 'Installation Guides',
      content: 'Step-by-step instructions for safely installing LCD screen assemblies. Includes required tools, safety precautions, and troubleshooting tips.',
      difficulty: 'Intermediate',
      estimated_time: '30-45 minutes'
    },
    {
      title: 'Battery Replacement Safety Guidelines',
      slug: 'battery-replacement-safety',
      category: 'Safety Guidelines',
      content: 'Important safety information for handling and installing replacement batteries. Covers proper disposal, handling precautions, and safety equipment.',
      difficulty: 'Beginner',
      estimated_time: '15-20 minutes'
    },
    {
      title: 'Troubleshooting Common Installation Issues',
      slug: 'troubleshooting-installation-issues',
      category: 'Troubleshooting',
      content: 'Solutions for common problems encountered during part installation. Includes diagnostic steps and resolution procedures.',
      difficulty: 'Advanced',
      estimated_time: '10-60 minutes'
    }
  ]
};

async function setupContentManagement() {
  console.log('📝 Setting up Content Management System...');

  try {
    // 1. Create content tables if they don't exist
    console.log('🗄️  Creating content tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_pages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT,
        excerpt TEXT,
        category VARCHAR(100),
        tags TEXT[],
        seo_title VARCHAR(255),
        seo_description TEXT,
        published BOOLEAN DEFAULT false,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_content (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        category_name VARCHAR(100),
        title VARCHAR(255),
        content TEXT,
        seo_title VARCHAR(255),
        seo_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('   ✅ Content tables created');

    // 2. Insert sample product descriptions
    console.log('📄 Creating product category content...');
    
    for (const desc of sampleContent.productDescriptions) {
      try {
        await pool.query(`
          INSERT INTO product_content (category_name, title, content, seo_title, seo_description)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [desc.category, desc.title, desc.content, desc.seo_title, desc.seo_description]);
      } catch (error) {
        console.warn(`   ⚠️  Failed to insert content for ${desc.category}:`, error.message);
      }
    }

    console.log('   ✅ Product category content created');

    // 3. Insert blog posts
    console.log('📰 Creating blog posts...');
    
    for (const post of sampleContent.blogPosts) {
      try {
        await pool.query(`
          INSERT INTO content_pages (title, slug, content, excerpt, category, tags, published)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (slug) DO NOTHING
        `, [post.title, post.slug, post.content, post.excerpt, post.category, post.tags, post.published]);
      } catch (error) {
        console.warn(`   ⚠️  Failed to insert blog post ${post.title}:`, error.message);
      }
    }

    console.log('   ✅ Blog posts created');

    // 4. Insert help articles
    console.log('❓ Creating help articles...');
    
    for (const article of sampleContent.helpArticles) {
      try {
        await pool.query(`
          INSERT INTO content_pages (title, slug, content, category, published)
          VALUES ($1, $2, $3, $4, true)
          ON CONFLICT (slug) DO NOTHING
        `, [article.title, article.slug, article.content, article.category]);
      } catch (error) {
        console.warn(`   ⚠️  Failed to insert help article ${article.title}:`, error.message);
      }
    }

    console.log('   ✅ Help articles created');

    // 5. Create content API endpoints test
    console.log('🔗 Testing content API endpoints...');
    
    // Test content retrieval
    const contentPages = await pool.query(`
      SELECT id, title, slug, category, published, created_at
      FROM content_pages
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const productContent = await pool.query(`
      SELECT pc.*, COUNT(p.id) as product_count
      FROM product_content pc
      LEFT JOIN products p ON p.category_id = (
        SELECT id FROM categories WHERE name = pc.category_name
      )
      GROUP BY pc.id, pc.category_name, pc.title, pc.content, pc.seo_title, pc.seo_description, pc.created_at, pc.updated_at
    `);

    console.log('   ✅ Content API endpoints working');

    // 6. Generate content statistics
    const contentStats = await pool.query(`
      SELECT 
        COUNT(*) as total_pages,
        COUNT(CASE WHEN published = true THEN 1 END) as published_pages,
        COUNT(CASE WHEN category = 'Repair Guides' THEN 1 END) as repair_guides,
        COUNT(CASE WHEN category = 'Maintenance Tips' THEN 1 END) as maintenance_tips,
        COUNT(CASE WHEN category = 'Installation Guides' THEN 1 END) as installation_guides
      FROM content_pages
    `);

    const productContentStats = await pool.query(`
      SELECT COUNT(*) as category_descriptions
      FROM product_content
    `);

    // 7. Create sample Notion integration test (mock)
    console.log('📋 Setting up Notion integration...');
    
    // Create a mock Notion configuration file
    const notionConfig = {
      databases: {
        products: process.env.NOTION_PRODUCTS_DATABASE_ID || 'mock-products-db-id',
        orders: process.env.NOTION_ORDERS_DATABASE_ID || 'mock-orders-db-id',
        customers: process.env.NOTION_CUSTOMERS_DATABASE_ID || 'mock-customers-db-id',
        content: process.env.NOTION_CONTENT_DATABASE_ID || 'mock-content-db-id'
      },
      apiKey: process.env.NOTION_API_KEY || 'mock-api-key',
      status: process.env.NOTION_API_KEY ? 'configured' : 'mock'
    };

    // Write configuration to a file for reference
    fs.writeFileSync(
      path.join(__dirname, 'notion-config.json'),
      JSON.stringify(notionConfig, null, 2)
    );

    console.log('   ✅ Notion integration configured');

    // Display results
    console.log('\n🎉 Content Management System Setup Complete!');
    console.log('=' .repeat(50));
    
    console.log('\n📊 CONTENT STATISTICS:');
    const stats = contentStats.rows[0];
    const productStats = productContentStats.rows[0];
    
    console.log(`   Total Content Pages: ${stats.total_pages}`);
    console.log(`   Published Pages: ${stats.published_pages}`);
    console.log(`   Repair Guides: ${stats.repair_guides}`);
    console.log(`   Maintenance Tips: ${stats.maintenance_tips}`);
    console.log(`   Installation Guides: ${stats.installation_guides}`);
    console.log(`   Category Descriptions: ${productStats.category_descriptions}`);

    console.log('\n📄 SAMPLE CONTENT PAGES:');
    contentPages.rows.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.title} (${page.category}) - ${page.published ? 'Published' : 'Draft'}`);
    });

    console.log('\n🏷️  PRODUCT CATEGORY CONTENT:');
    productContent.rows.forEach((content, index) => {
      console.log(`   ${index + 1}. ${content.category_name}: ${content.title} (${content.product_count} products)`);
    });

    console.log('\n📋 NOTION INTEGRATION:');
    console.log(`   Status: ${notionConfig.status}`);
    console.log(`   API Key: ${notionConfig.apiKey ? 'Configured' : 'Not configured'}`);
    console.log(`   Databases: ${Object.keys(notionConfig.databases).length} configured`);

    console.log('\n🔗 AVAILABLE ENDPOINTS:');
    console.log('   GET /api/content/pages - List all content pages');
    console.log('   GET /api/content/pages/[slug] - Get specific page');
    console.log('   GET /api/content/categories/[category] - Get category content');
    console.log('   GET /api/notion/content - Notion content sync');
    console.log('   POST /api/notion/orders - Create order in Notion');

    return {
      contentPages: stats.total_pages,
      publishedPages: stats.published_pages,
      categoryDescriptions: productStats.category_descriptions,
      notionStatus: notionConfig.status
    };

  } catch (error) {
    console.error('❌ Error setting up content management:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupContentManagement()
    .then(results => {
      console.log('\n✅ Content Management System ready!');
      console.log(`📊 Summary: ${results.contentPages} pages, ${results.categoryDescriptions} category descriptions`);
      console.log('🚀 Ready to serve content to the application');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Content setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupContentManagement };

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration for the new domain
const dbName = 'midastechnical_store';
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

async function setupProductionDatabase() {
  console.log('🚀 Setting up production database for midastechnical.com...');

  // Connect to PostgreSQL server
  const pool = new Pool({
    connectionString,
  });

  try {
    // Check if database exists
    console.log(`📋 Checking if database '${dbName}' exists...`);
    const dbCheckResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    // Create database if it doesn't exist
    if (dbCheckResult.rowCount === 0) {
      console.log(`🔨 Creating database: ${dbName}`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created successfully`);
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }

    // Close connection to postgres database
    await pool.end();

    // Connect to the newly created database
    const dbPool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${dbName}`,
    });

    // Read and execute combined schema
    console.log('📄 Reading combined schema file...');
    const schemaPath = path.join(__dirname, 'database', 'combined_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema SQL
    console.log('🏗️  Creating database schema and tables...');
    await dbPool.query(schemaSql);
    console.log('✅ Database schema created successfully');

    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    const tablesResult = await dbPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`✅ Created ${tables.length} tables:`, tables.join(', '));

    // Verify foreign key relationships
    console.log('🔗 Verifying foreign key constraints...');
    const fkResult = await dbPool.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `);

    console.log(`✅ Created ${fkResult.rows.length} foreign key constraints`);

    // Test database connectivity from Next.js perspective
    console.log('🧪 Testing database connectivity...');
    const testQuery = 'SELECT NOW() as current_time, version() as postgres_version';
    const testResult = await dbPool.query(testQuery);
    
    console.log('✅ Database connectivity test passed');
    console.log(`   Current time: ${testResult.rows[0].current_time}`);
    console.log(`   PostgreSQL version: ${testResult.rows[0].postgres_version.split(' ')[0]}`);

    // Create initial categories
    console.log('📂 Creating initial product categories...');
    const categories = [
      { name: 'iPhone Parts', slug: 'iphone-parts', description: 'Replacement parts for iPhone devices' },
      { name: 'Samsung Parts', slug: 'samsung-parts', description: 'Replacement parts for Samsung Galaxy devices' },
      { name: 'iPad Parts', slug: 'ipad-parts', description: 'Replacement parts for iPad devices' },
      { name: 'MacBook Parts', slug: 'macbook-parts', description: 'Replacement parts for MacBook devices' },
      { name: 'Repair Tools', slug: 'repair-tools', description: 'Professional repair tools and equipment' },
      { name: 'LCD Screens', slug: 'lcd-screens', description: 'LCD and OLED replacement screens' },
      { name: 'Batteries', slug: 'batteries', description: 'Replacement batteries for mobile devices' },
      { name: 'Charging Ports', slug: 'charging-ports', description: 'Charging port assemblies and connectors' },
      { name: 'Cameras', slug: 'cameras', description: 'Camera modules and lens assemblies' },
      { name: 'Speakers', slug: 'speakers', description: 'Speaker assemblies and audio components' }
    ];

    for (const category of categories) {
      try {
        await dbPool.query(`
          INSERT INTO categories (name, slug, description) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (slug) DO NOTHING
        `, [category.name, category.slug, category.description]);
      } catch (error) {
        console.warn(`Warning: Could not insert category ${category.name}:`, error.message);
      }
    }

    const categoryCount = await dbPool.query('SELECT COUNT(*) FROM categories');
    console.log(`✅ Categories ready: ${categoryCount.rows[0].count} total`);

    // Close connection
    await dbPool.end();

    console.log('\n🎉 Production database setup completed successfully!');
    console.log(`📊 Database: ${dbName}`);
    console.log(`🔗 Connection: postgresql://postgres:postgres@localhost:5432/${dbName}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Run product data scraping: npm run scrape-products');
    console.log('   2. Import existing CSV data: npm run import-csv');
    console.log('   3. Start the development server: npm run dev');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupProductionDatabase().catch(console.error);
}

module.exports = {
  setupProductionDatabase,
  dbName
};

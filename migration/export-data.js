#!/usr/bin/env node

/**
 * Enhanced Data Export Script for midastechnical.com WordPress Migration
 * Exports data from Next.js PostgreSQL database to WordPress-compatible formats
 * Optimized for WooCommerce import and data integrity preservation
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-writer');
const https = require('https');
const { URL } = require('url');

// Database configuration for midastechnical.com
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mdtstech_store',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Create export directory
const exportDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

/**
 * Export Products to WooCommerce CSV format
 */
async function exportProducts() {
  console.log('Exporting products...');

  const query = `
    SELECT
      p.id,
      p.name,
      p.slug,
      p.sku,
      p.description,
      p.price,
      p.discount_percentage,
      p.stock_quantity,
      p.is_featured,
      p.is_new,
      p.image_url,
      p.brand,
      p.weight,
      p.dimensions,
      c.name as category_name,
      c.slug as category_slug,
      ps.display,
      ps.processor,
      ps.memory,
      ps.storage,
      ps.camera,
      ps.battery,
      ps.connectivity,
      ps.operating_system,
      ps.additional_features
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_specifications ps ON p.id = ps.product_id
    ORDER BY p.id
  `;

  const result = await pool.query(query);

  const csvWriter = csv.createObjectCsvWriter({
    path: path.join(exportDir, 'products.csv'),
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'slug', title: 'Slug' },
      { id: 'sku', title: 'SKU' },
      { id: 'description', title: 'Description' },
      { id: 'price', title: 'Regular price' },
      { id: 'sale_price', title: 'Sale price' },
      { id: 'stock_quantity', title: 'Stock' },
      { id: 'category_name', title: 'Categories' },
      { id: 'image_url', title: 'Images' },
      { id: 'brand', title: 'Brand' },
      { id: 'is_featured', title: 'Featured' },
      { id: 'screen_size', title: 'Screen Size' },
      { id: 'color', title: 'Color' },
      { id: 'storage_capacity', title: 'Storage' },
      { id: 'condition_grade', title: 'Condition' },
      { id: 'compatibility', title: 'Compatibility' }
    ]
  });

  const products = result.rows.map(row => ({
    ...row,
    sale_price: row.discount_percentage > 0
      ? (row.price * (1 - row.discount_percentage / 100)).toFixed(2)
      : '',
    is_featured: row.is_featured ? '1' : '0'
  }));

  await csvWriter.writeRecords(products);
  console.log(`Exported ${products.length} products to products.csv`);
}

/**
 * Export Categories
 */
async function exportCategories() {
  console.log('Exporting categories...');

  const query = `
    SELECT
      id,
      name,
      slug,
      description,
      parent_id,
      image_url
    FROM categories
    ORDER BY parent_id NULLS FIRST, id
  `;

  const result = await pool.query(query);

  const csvWriter = csv.createObjectCsvWriter({
    path: path.join(exportDir, 'categories.csv'),
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'slug', title: 'Slug' },
      { id: 'description', title: 'Description' },
      { id: 'parent_id', title: 'Parent' },
      { id: 'image_url', title: 'Image' }
    ]
  });

  await csvWriter.writeRecords(result.rows);
  console.log(`Exported ${result.rows.length} categories to categories.csv`);
}

/**
 * Export Users (for reference, manual import recommended)
 */
async function exportUsers() {
  console.log('Exporting users...');

  const query = `
    SELECT
      id,
      email,
      first_name,
      last_name,
      phone,
      created_at,
      is_admin
    FROM users
    ORDER BY id
  `;

  const result = await pool.query(query);

  const csvWriter = csv.createObjectCsvWriter({
    path: path.join(exportDir, 'users.csv'),
    header: [
      { id: 'id', title: 'ID' },
      { id: 'email', title: 'Email' },
      { id: 'first_name', title: 'First Name' },
      { id: 'last_name', title: 'Last Name' },
      { id: 'phone', title: 'Phone' },
      { id: 'created_at', title: 'Registration Date' },
      { id: 'is_admin', title: 'Is Admin' }
    ]
  });

  await csvWriter.writeRecords(result.rows);
  console.log(`Exported ${result.rows.length} users to users.csv`);
}

/**
 * Export Orders
 */
async function exportOrders() {
  console.log('Exporting orders...');

  const query = `
    SELECT
      o.id,
      o.order_number,
      o.user_id,
      u.email as customer_email,
      o.status,
      o.total_amount,
      o.shipping_cost,
      o.payment_method,
      o.payment_status,
      o.created_at,
      o.notes
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;

  const result = await pool.query(query);

  const csvWriter = csv.createObjectCsvWriter({
    path: path.join(exportDir, 'orders.csv'),
    header: [
      { id: 'id', title: 'Order ID' },
      { id: 'order_number', title: 'Order Number' },
      { id: 'customer_email', title: 'Customer Email' },
      { id: 'status', title: 'Status' },
      { id: 'total_amount', title: 'Total' },
      { id: 'shipping_cost', title: 'Shipping' },
      { id: 'payment_method', title: 'Payment Method' },
      { id: 'payment_status', title: 'Payment Status' },
      { id: 'created_at', title: 'Date Created' },
      { id: 'shipping_address', title: 'Shipping Address' },
      { id: 'billing_address', title: 'Billing Address' }
    ]
  });

  await csvWriter.writeRecords(result.rows);
  console.log(`Exported ${result.rows.length} orders to orders.csv`);
}

/**
 * Main export function
 */
async function main() {
  try {
    console.log('Starting data export for WordPress migration...');

    await exportProducts();
    await exportCategories();
    await exportUsers();
    await exportOrders();

    console.log('\n✅ Export completed successfully!');
    console.log(`Files saved to: ${exportDir}`);
    console.log('\nNext steps:');
    console.log('1. Import products.csv into WooCommerce');
    console.log('2. Import categories.csv into WooCommerce');
    console.log('3. Manually review and import users');
    console.log('4. Import orders for historical data');

  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the export
if (require.main === module) {
  main();
}

module.exports = { exportProducts, exportCategories, exportUsers, exportOrders };

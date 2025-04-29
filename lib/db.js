import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Helper function to execute SQL queries
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

// Get all products with optional pagination
export async function getProducts(page = 1, limit = 20, categorySlug) {
  const offset = (page - 1) * limit;

  let queryText = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;

  const queryParams = [];

  // Add category filter if provided
  if (categorySlug) {
    queryText += `
      WHERE c.slug = $1
    `;
    queryParams.push(categorySlug);
  }

  // Add ordering and pagination
  queryText += `
    ORDER BY p.created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;

  queryParams.push(limit, offset);

  const result = await query(queryText, queryParams);

  // Format the products
  return result.rows.map(product => ({
    ...product,
    price: parseFloat(product.price),
    discount_percentage: parseFloat(product.discount_percentage || 0),
    discounted_price: product.discount_percentage
      ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
      : parseFloat(product.price)
  }));
}

// Get product by slug
export async function getProductBySlug(slug) {
  const productQuery = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = $1
  `;

  const productResult = await query(productQuery, [slug]);

  if (productResult.rows.length === 0) {
    return null;
  }

  const product = productResult.rows[0];

  // Get product specifications
  const specsQuery = `
    SELECT * FROM product_specifications
    WHERE product_id = $1
  `;
  const specsResult = await query(specsQuery, [product.id]);

  // Combine all data and format
  return {
    ...product,
    price: parseFloat(product.price),
    discount_percentage: parseFloat(product.discount_percentage || 0),
    discounted_price: product.discount_percentage
      ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
      : parseFloat(product.price),
    specifications: specsResult.rows[0] || {}
  };
}

// Get all categories
export async function getCategories() {
  const queryText = `
    SELECT c.*,
           (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
    FROM categories c
    ORDER BY c.name
  `;

  const result = await query(queryText);
  return result.rows;
}

// Get category by slug
export async function getCategoryBySlug(slug) {
  const queryText = `
    SELECT c.*,
           (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
    FROM categories c
    WHERE c.slug = $1
  `;

  const result = await query(queryText, [slug]);
  return result.rows[0] || null;
}

// Get featured products
export async function getFeaturedProducts(limit = 8) {
  const queryText = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT $1
  `;

  const result = await query(queryText, [limit]);
  return result.rows;
}

// Export the pool and functions for direct access if needed
export default {
  pool,
  query,
  getProducts,
  getProductBySlug,
  getCategories,
  getCategoryBySlug,
  getFeaturedProducts
};

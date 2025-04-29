import { getProductBySlug } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Get product slug from URL
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Product slug is required'
      });
    }
    
    // Fetch product from database
    const product = await getProductBySlug(slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Return product as JSON
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

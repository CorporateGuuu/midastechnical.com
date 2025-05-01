import { getSession } from 'next-auth/react';
import { query } from '../../lib/db';

// Mock cart data for development
const mockCart = {
  id: 1,
  user_id: 1,
  items: [
    {
      id: 1,
      product_id: 1,
      name: 'iPhone 13 Pro OLED Screen',
      slug: 'iphone-13-pro-oled-screen',
      price: 129.99,
      discount_percentage: 10,
      discounted_price: 116.99,
      quantity: 1,
      total: 116.99,
      image_url: '/images/products/iphone-13-screen.jpg',
      category_name: 'iPhone Parts'
    },
    {
      id: 2,
      product_id: 3,
      name: 'Samsung Galaxy S22 Battery',
      slug: 'samsung-galaxy-s22-battery',
      price: 39.99,
      discount_percentage: 0,
      discounted_price: 39.99,
      quantity: 2,
      total: 79.98,
      image_url: '/images/products/samsung-s21-screen.jpg',
      category_name: 'Samsung Parts'
    }
  ],
  item_count: 3,
  subtotal: 196.97,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export default async function handler(req, res) {
  // Get user session
  const session = await getSession({ req });

  // For development, allow access without authentication
  const isAuthenticated = process.env.NODE_ENV === 'development' || !!session;

  if (!isAuthenticated) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getCart(req, res, session);
    case 'POST':
      return addToCart(req, res, session);
    case 'PUT':
      return updateCartItem(req, res, session);
    case 'DELETE':
      return removeFromCart(req, res, session);
    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
  }
}

// Get cart
async function getCart(req, res, session) {
  try {
    // In a real implementation, fetch cart from database
    // For now, return mock data

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return res.status(200).json({
      success: true,
      cart: mockCart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Add item to cart
async function addToCart(req, res, session) {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // In a real implementation, add item to cart in database
    // For now, return mock data with added item

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return updated cart
    return res.status(200).json({
      success: true,
      cart: mockCart,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Update cart item
async function updateCartItem(req, res, session) {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required'
      });
    }

    // In a real implementation, update item in database
    // For now, return mock data with updated item

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return updated cart
    return res.status(200).json({
      success: true,
      cart: mockCart,
      message: 'Cart updated'
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Remove item from cart
async function removeFromCart(req, res, session) {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // In a real implementation, remove item from database
    // For now, return mock data with item removed

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return updated cart
    return res.status(200).json({
      success: true,
      cart: mockCart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

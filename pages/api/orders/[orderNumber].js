import { getSession } from 'next-auth/react';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Ensure user is authenticated
  if (!session?.user?.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  const { orderNumber } = req.query;
  
  if (!orderNumber) {
    return res.status(400).json({
      success: false,
      message: 'Order number is required'
    });
  }
  
  switch (req.method) {
    case 'GET':
      return getOrder(req, res, session.user.id, orderNumber);
    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
  }
}

// Get order details
async function getOrder(req, res, userId, orderNumber) {
  try {
    // Get order
    const orderResult = await query(`
      SELECT o.id, o.order_number, o.status, o.total_amount, 
             o.shipping_address, o.billing_address, o.payment_method,
             o.payment_status, o.shipping_method, o.shipping_cost,
             o.notes, o.created_at
      FROM orders o
      WHERE o.order_number = $1 AND o.user_id = $2
    `, [orderNumber, userId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const orderItemsResult = await query(`
      SELECT oi.id, oi.product_id, oi.product_name, oi.product_price,
             oi.quantity, oi.discount_percentage, oi.total_price,
             p.image_url, p.slug
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [order.id]);
    
    const orderItems = orderItemsResult.rows.map(item => ({
      ...item,
      product_price: parseFloat(item.product_price),
      discount_percentage: parseFloat(item.discount_percentage || 0),
      total_price: parseFloat(item.total_price)
    }));
    
    // Get order status history
    const statusHistoryResult = await query(`
      SELECT status, notes, created_at
      FROM order_status_history
      WHERE order_id = $1
      ORDER BY created_at DESC
    `, [order.id]);
    
    // Format order data
    const formattedOrder = {
      ...order,
      total_amount: parseFloat(order.total_amount),
      shipping_cost: parseFloat(order.shipping_cost || 0),
      shipping_address: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address,
      billing_address: typeof order.billing_address === 'string' 
        ? JSON.parse(order.billing_address) 
        : order.billing_address,
      payment_method: typeof order.payment_method === 'string' 
        ? JSON.parse(order.payment_method) 
        : order.payment_method,
      items: orderItems,
      status_history: statusHistoryResult.rows
    };
    
    // Return order
    return res.status(200).json({
      success: true,
      order: formattedOrder
    });
  } catch (error) {
    console.error('Error getting order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting order'
    });
  }
}

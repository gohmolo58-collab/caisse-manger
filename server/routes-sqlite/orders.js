const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, authorize } = require('../middleware/auth-sqlite');

// Get all orders
router.get('/', auth, (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    let query = `
      SELECT o.*, u.name as cashier_name
      FROM orders o
      LEFT JOIN users u ON o.cashier_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    if (paymentStatus) {
      query += ' AND o.payment_status = ?';
      params.push(paymentStatus);
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = db.prepare(query).all(...params);
    
    // Get items for each order
    orders.forEach(order => {
      order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      order.cashier = order.cashier_name ? { name: order.cashier_name } : null;
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, (req, res) => {
  try {
    const order = db.prepare(`
      SELECT o.*, u.name as cashier_name, u.email as cashier_email
      FROM orders o
      LEFT JOIN users u ON o.cashier_id = u.id
      WHERE o.id = ?
    `).get(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    order.cashier = order.cashier_name ? { name: order.cashier_name, email: order.cashier_email } : null;

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create order
router.post('/', auth, authorize('admin', 'cashier'), (req, res) => {
  try {
    const { type, tableNumber, items, discount, notes } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    items.forEach(item => {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.menuItem);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItem}`);
      }
      if (!menuItem.available) {
        throw new Error(`Item not available: ${menuItem.name}`);
      }

      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        menuItem: menuItem.id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal: itemSubtotal
      });
    });

    // Get tax rate
    const settings = db.prepare('SELECT tax_rate FROM settings WHERE id = 1').get();
    const taxRate = settings ? settings.tax_rate : 20;

    const discountAmount = discount || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = (subtotalAfterDiscount * taxRate) / 100;
    const total = subtotalAfterDiscount + tax;

    // Generate order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const todayCount = db.prepare(`
      SELECT COUNT(*) as count FROM orders 
      WHERE DATE(created_at) = DATE('now')
    `).get();
    const orderNumber = `ORD-${dateStr}-${String(todayCount.count + 1).padStart(4, '0')}`;

    // Insert order
    const orderResult = db.prepare(`
      INSERT INTO orders (order_number, type, table_number, subtotal, discount, tax, total, cashier_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderNumber, type, tableNumber || '', subtotal, discountAmount, tax, total, req.user.id, notes || '');

    const orderId = orderResult.lastInsertRowid;

    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, name, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    orderItems.forEach(item => {
      insertItem.run(orderId, item.menuItem, item.name, item.quantity, item.price, item.subtotal);
    });

    // Get complete order
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    order.cashier = { name: req.user.name };

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, (req, res) => {
  try {
    const { status } = req.body;
    const updates = { status };
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    db.prepare(`
      UPDATE orders 
      SET status = ?, completed_at = ?
      WHERE id = ?
    `).run(status, updates.completed_at || null, req.params.id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment status
router.patch('/:id/payment', auth, authorize('admin', 'cashier'), (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    db.prepare(`
      UPDATE orders 
      SET payment_status = ?, payment_method = ?
      WHERE id = ?
    `).run(paymentStatus, paymentMethod, req.params.id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get today's summary
router.get('/today/summary', auth, (req, res) => {
  try {
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalRevenue,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingOrders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedOrders
      FROM orders
      WHERE DATE(created_at) = DATE('now')
    `).get();

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

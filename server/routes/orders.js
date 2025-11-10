const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Ingredient = require('../models/Ingredient');
const { auth, authorize } = require('../middleware/auth');

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query;
    let query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('cashier', 'name')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cashier', 'name email')
      .populate('items.menuItem');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create order
router.post('/', auth, authorize('admin', 'cashier'), async (req, res) => {
  try {
    const { type, tableNumber, items, discount, notes } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ message: `Item not available: ${menuItem.name}` });
      }

      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal: itemSubtotal
      });

      // Decrement inventory
      if (menuItem.ingredients && menuItem.ingredients.length > 0) {
        for (const ing of menuItem.ingredients) {
          const ingredient = await Ingredient.findById(ing.ingredientId);
          if (ingredient) {
            ingredient.currentStock -= (ing.quantity * item.quantity);
            await ingredient.save();
          }
        }
      }
    }

    // Get tax rate from settings
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    const taxRate = settings ? settings.taxRate : 20;

    const discountAmount = discount || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = (subtotalAfterDiscount * taxRate) / 100;
    const total = subtotalAfterDiscount + tax;

    const order = new Order({
      type,
      tableNumber,
      items: orderItems,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      cashier: req.user._id,
      notes
    });

    await order.save();
    await order.populate('cashier', 'name');
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'completed' && { completedAt: new Date() })
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment status
router.patch('/:id/payment', auth, authorize('admin', 'cashier'), async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get today's orders
router.get('/today/summary', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
      createdAt: { $gte: today }
    });

    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'completed').length
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

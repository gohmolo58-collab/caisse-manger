const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');

// Get sales report
router.get('/sales', auth, authorize('admin', 'cashier'), async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    let start, end;

    const now = new Date();
    
    switch (period) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1));
        end = new Date();
        break;
      case 'custom':
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
    }

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: 'paid'
    }).populate('items.menuItem');

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Sales by category
    const categoryStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.menuItem?.category || 'Other';
        if (!categoryStats[category]) {
          categoryStats[category] = { revenue: 0, quantity: 0 };
        }
        categoryStats[category].revenue += item.subtotal;
        categoryStats[category].quantity += item.quantity;
      });
    });

    // Top selling items
    const itemStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.name;
        if (!itemStats[itemName]) {
          itemStats[itemName] = { quantity: 0, revenue: 0 };
        }
        itemStats[itemName].quantity += item.quantity;
        itemStats[itemName].revenue += item.subtotal;
      });
    });

    const topItems = Object.entries(itemStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Sales by payment method
    const paymentMethods = {};
    orders.forEach(order => {
      const method = order.paymentMethod || 'unknown';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, revenue: 0 };
      }
      paymentMethods[method].count++;
      paymentMethods[method].revenue += order.total;
    });

    res.json({
      period: { start, end },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue
      },
      categoryStats,
      topItems,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get daily revenue chart data
router.get('/daily-revenue', auth, authorize('admin', 'cashier'), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const data = [];

    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const orders = await Order.find({
        createdAt: { $gte: date, $lt: nextDay },
        paymentStatus: 'paid'
      });

      const revenue = orders.reduce((sum, order) => sum + order.total, 0);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue,
        orders: orders.length
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

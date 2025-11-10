const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { auth } = require('../middleware/auth');

// AI Sales Assistant - Get recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const currentHour = new Date().getHours();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      paymentStatus: 'paid'
    }).populate('items.menuItem');

    // Get last 30 days orders for pattern analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'paid'
    }).populate('items.menuItem');

    // Analyze item frequency
    const itemFrequency = {};
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.name;
        if (!itemFrequency[itemName]) {
          itemFrequency[itemName] = { count: 0, revenue: 0 };
        }
        itemFrequency[itemName].count += item.quantity;
        itemFrequency[itemName].revenue += item.subtotal;
      });
    });

    // Time-based recommendations
    let timeBasedSuggestion = '';
    let suggestedCategory = '';

    if (currentHour >= 6 && currentHour < 11) {
      timeBasedSuggestion = 'Morning rush - Promote breakfast combos';
      suggestedCategory = 'Beverages';
    } else if (currentHour >= 11 && currentHour < 15) {
      timeBasedSuggestion = 'Lunch time - Suggest meal deals';
      suggestedCategory = 'Food';
    } else if (currentHour >= 15 && currentHour < 18) {
      timeBasedSuggestion = 'Afternoon - Promote coffee and pastries';
      suggestedCategory = 'Pastries';
    } else {
      timeBasedSuggestion = 'Evening - Suggest dinner specials';
      suggestedCategory = 'Food';
    }

    // Find trending items (items with increasing sales)
    const trendingItems = Object.entries(itemFrequency)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Combo suggestions based on frequently ordered together items
    const comboPairs = {};
    recentOrders.forEach(order => {
      if (order.items.length > 1) {
        for (let i = 0; i < order.items.length; i++) {
          for (let j = i + 1; j < order.items.length; j++) {
            const pair = [order.items[i].name, order.items[j].name].sort().join(' + ');
            comboPairs[pair] = (comboPairs[pair] || 0) + 1;
          }
        }
      }
    });

    const topCombos = Object.entries(comboPairs)
      .map(([combo, count]) => ({ combo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Sales insights
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const avgDailyRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0) / 30;
    const performanceVsAverage = ((todayRevenue / avgDailyRevenue - 1) * 100).toFixed(1);

    res.json({
      timeBasedSuggestion,
      suggestedCategory,
      trendingItems,
      recommendedCombos: topCombos,
      insights: {
        todayRevenue: todayRevenue.toFixed(2),
        avgDailyRevenue: avgDailyRevenue.toFixed(2),
        performanceVsAverage: `${performanceVsAverage}%`,
        totalOrdersToday: todayOrders.length
      },
      promotionIdeas: [
        `Create a "${suggestedCategory} Special" for this time of day`,
        topCombos.length > 0 ? `Offer combo deal: ${topCombos[0].combo}` : 'Bundle popular items together',
        trendingItems.length > 0 ? `Feature "${trendingItems[0].name}" as today's special` : 'Promote seasonal items'
      ]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

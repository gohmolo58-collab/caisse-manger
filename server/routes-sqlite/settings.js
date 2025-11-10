const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, authorize } = require('../middleware/auth-sqlite');

// Get settings
router.get('/', auth, (req, res) => {
  try {
    let settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    if (!settings) {
      db.prepare(`
        INSERT INTO settings (id, restaurant_name, currency, tax_rate, theme)
        VALUES (1, 'Caisse Manager Pro', 'EUR', 20, 'light')
      `).run();
      settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update settings (admin only)
router.put('/', auth, authorize('admin'), (req, res) => {
  try {
    const { restaurant_name, currency, tax_rate, address, phone, email, theme } = req.body;
    
    db.prepare(`
      UPDATE settings 
      SET restaurant_name = ?, currency = ?, tax_rate = ?, address = ?, phone = ?, email = ?, theme = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(restaurant_name, currency, tax_rate, address || '', phone || '', email || '', theme);

    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

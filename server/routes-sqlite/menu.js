const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, authorize } = require('../middleware/auth-sqlite');

// Get all menu items
router.get('/', auth, (req, res) => {
  try {
    const { category, available, search } = req.query;
    let query = 'SELECT * FROM menu_items WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (available !== undefined) {
      query += ' AND available = ?';
      params.push(available === 'true' ? 1 : 0);
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY category, name';

    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single menu item
router.get('/:id', auth, (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create menu item
router.post('/', auth, authorize('admin', 'cashier'), (req, res) => {
  try {
    const { name, category, price, description, available } = req.body;
    const result = db.prepare(`
      INSERT INTO menu_items (name, category, price, description, available)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, category, price, description || '', available ? 1 : 0);

    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update menu item
router.put('/:id', auth, authorize('admin', 'cashier'), (req, res) => {
  try {
    const { name, category, price, description, available } = req.body;
    db.prepare(`
      UPDATE menu_items 
      SET name = ?, category = ?, price = ?, description = ?, available = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, category, price, description, available ? 1 : 0, req.params.id);

    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete menu item
router.delete('/:id', auth, authorize('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get categories
router.get('/categories/list', auth, (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM menu_items ORDER BY category').all();
    res.json(categories.map(c => c.category));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

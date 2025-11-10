const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { auth, authorize } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', auth, authorize('admin'), (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, active, created_at FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create user (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hashedPassword, role);

    res.status(201).json({ message: 'User created successfully', userId: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user (admin only)
router.put('/:id', auth, authorize('admin'), (req, res) => {
  try {
    const { name, email, role, active } = req.body;
    db.prepare('UPDATE users SET name = ?, email = ?, role = ?, active = ? WHERE id = ?').run(name, email, role, active ? 1 : 0, req.params.id);
    
    const user = db.prepare('SELECT id, name, email, role, active, created_at FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

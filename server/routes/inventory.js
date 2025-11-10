const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const { auth, authorize } = require('../middleware/auth');

// Get all ingredients
router.get('/', auth, async (req, res) => {
  try {
    const { lowStock } = req.query;
    let query = {};
    
    const ingredients = await Ingredient.find(query).sort({ name: 1 });
    
    let result = ingredients;
    if (lowStock === 'true') {
      result = ingredients.filter(ing => ing.currentStock <= ing.minStock);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single ingredient
router.get('/:id', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create ingredient (admin/cashier)
router.post('/', auth, authorize('admin', 'cashier'), async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update ingredient (admin/cashier)
router.put('/:id', auth, authorize('admin', 'cashier'), async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Restock ingredient
router.patch('/:id/restock', auth, authorize('admin', 'cashier'), async (req, res) => {
  try {
    const { quantity } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    ingredient.currentStock += quantity;
    ingredient.lastRestocked = new Date();
    await ingredient.save();

    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete ingredient (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

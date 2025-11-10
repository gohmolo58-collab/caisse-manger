const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'l', 'ml', 'pcs', 'units']
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    required: true,
    default: 10
  },
  cost: {
    type: Number,
    default: 0
  },
  supplier: {
    type: String,
    default: ''
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ingredientSchema.virtual('needsRestock').get(function() {
  return this.currentStock <= this.minStock;
});

module.exports = mongoose.model('Ingredient', ingredientSchema);

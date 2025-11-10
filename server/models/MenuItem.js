const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Beverages', 'Food', 'Pastries', 'Desserts', 'Appetizers', 'Main Course', 'Other']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  },
  ingredients: [{
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient'
    },
    quantity: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

menuItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);

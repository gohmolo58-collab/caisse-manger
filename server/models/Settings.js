const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    default: 'Caisse Manager Pro'
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  taxRate: {
    type: Number,
    default: 20,
    min: 0,
    max: 100
  },
  logo: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);

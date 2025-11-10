const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/ai', require('./routes/ai'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caisse-manager')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    initializeDefaultData();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Initialize default data
async function initializeDefaultData() {
  const User = require('./models/User');
  const Settings = require('./models/Settings');
  const MenuItem = require('./models/MenuItem');
  const bcrypt = require('bcryptjs');

  try {
    // Create default users if none exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultUsers = [
        {
          name: 'Admin User',
          email: 'admin@caisse.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'admin'
        },
        {
          name: 'Cashier User',
          email: 'cashier@caisse.com',
          password: await bcrypt.hash('cashier123', 10),
          role: 'cashier'
        },
        {
          name: 'Kitchen Staff',
          email: 'kitchen@caisse.com',
          password: await bcrypt.hash('kitchen123', 10),
          role: 'kitchen'
        }
      ];
      await User.insertMany(defaultUsers);
      console.log('✅ Default users created');
    }

    // Create default settings if none exist
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        restaurantName: 'Caisse Manager Pro',
        currency: 'EUR',
        taxRate: 20,
        logo: '',
        theme: 'light'
      });
      console.log('✅ Default settings created');
    }

    // Create sample menu items if none exist
    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      const sampleMenu = [
        {
          name: 'Espresso',
          category: 'Beverages',
          price: 2.50,
          description: 'Strong Italian coffee',
          image: '',
          available: true,
          ingredients: []
        },
        {
          name: 'Cappuccino',
          category: 'Beverages',
          price: 3.50,
          description: 'Espresso with steamed milk foam',
          image: '',
          available: true,
          ingredients: []
        },
        {
          name: 'Croissant',
          category: 'Pastries',
          price: 2.00,
          description: 'Buttery French pastry',
          image: '',
          available: true,
          ingredients: []
        },
        {
          name: 'Caesar Salad',
          category: 'Food',
          price: 8.50,
          description: 'Fresh romaine with Caesar dressing',
          image: '',
          available: true,
          ingredients: []
        },
        {
          name: 'Margherita Pizza',
          category: 'Food',
          price: 12.00,
          description: 'Classic tomato, mozzarella, and basil',
          image: '',
          available: true,
          ingredients: []
        }
      ];
      await MenuItem.insertMany(sampleMenu);
      console.log('✅ Sample menu items created');
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes - SQLite versions
app.use('/api/auth', require('./routes-sqlite/auth'));
app.use('/api/users', require('./routes-sqlite/users'));
app.use('/api/menu', require('./routes-sqlite/menu'));
app.use('/api/orders', require('./routes-sqlite/orders'));
app.use('/api/settings', require('./routes-sqlite/settings'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Using SQLite database`);
});

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database
const db = new Database(path.join(__dirname, '../database.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'cashier', 'kitchen')),
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Menu items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT,
      available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('dine-in', 'takeout', 'delivery')),
      table_number TEXT,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
      payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'paid', 'refunded')),
      payment_method TEXT,
      cashier_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (cashier_id) REFERENCES users(id)
    )
  `);

  // Order items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )
  `);

  // Ingredients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      unit TEXT NOT NULL,
      current_stock REAL NOT NULL DEFAULT 0,
      min_stock REAL NOT NULL DEFAULT 10,
      cost REAL DEFAULT 0,
      supplier TEXT,
      last_restocked DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      restaurant_name TEXT DEFAULT 'Caisse Manager Pro',
      currency TEXT DEFAULT 'EUR',
      tax_rate REAL DEFAULT 20,
      logo TEXT,
      theme TEXT DEFAULT 'light',
      address TEXT,
      phone TEXT,
      email TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database tables created');

  // Insert default data
  insertDefaultData();
}

function insertDefaultData() {
  // Check if users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (userCount.count === 0) {
    const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    
    insertUser.run('Admin User', 'admin@caisse.com', bcrypt.hashSync('admin123', 10), 'admin');
    insertUser.run('Cashier User', 'cashier@caisse.com', bcrypt.hashSync('cashier123', 10), 'cashier');
    insertUser.run('Kitchen Staff', 'kitchen@caisse.com', bcrypt.hashSync('kitchen123', 10), 'kitchen');
    
    console.log('✅ Default users created');
  }

  // Check if settings exist
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO settings (id, restaurant_name, currency, tax_rate, theme)
      VALUES (1, 'Caisse Manager Pro', 'EUR', 20, 'light')
    `).run();
    
    console.log('✅ Default settings created');
  }

  // Check if menu items exist
  const menuCount = db.prepare('SELECT COUNT(*) as count FROM menu_items').get();
  
  if (menuCount.count === 0) {
    const insertMenuItem = db.prepare(`
      INSERT INTO menu_items (name, category, price, description, available)
      VALUES (?, ?, ?, ?, 1)
    `);
    
    insertMenuItem.run('Espresso', 'Beverages', 2.50, 'Strong Italian coffee');
    insertMenuItem.run('Cappuccino', 'Beverages', 3.50, 'Espresso with steamed milk foam');
    insertMenuItem.run('Croissant', 'Pastries', 2.00, 'Buttery French pastry');
    insertMenuItem.run('Caesar Salad', 'Food', 8.50, 'Fresh romaine with Caesar dressing');
    insertMenuItem.run('Margherita Pizza', 'Food', 12.00, 'Classic tomato, mozzarella, and basil');
    
    console.log('✅ Sample menu items created');
  }
}

// Initialize database
initializeDatabase();

module.exports = db;

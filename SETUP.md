# Caisse Manager Pro - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/caisse-manager
JWT_SECRET=your_secure_jwt_secret_key_change_this
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Or run manually
mongod --dbpath /path/to/data/directory
```

### 4. Run the Application

```bash
# Development mode (runs both backend and frontend)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Login Credentials

After first run, the system creates these default accounts:

- **Admin**: admin@caisse.com / admin123
- **Cashier**: cashier@caisse.com / cashier123
- **Kitchen**: kitchen@caisse.com / kitchen123

**⚠️ Change these passwords immediately in production!**

## MongoDB Setup Options

### Option 1: Local MongoDB
Install MongoDB locally: https://www.mongodb.com/try/download/community

### Option 2: MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` with your Atlas connection string

Example Atlas URI:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/caisse-manager?retryWrites=true&w=majority
```

## Deployment

### Deploy Backend (Render)

1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect your repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables (PORT, MONGODB_URI, JWT_SECRET)

### Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Import your repository
3. Configure:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL`: Your backend URL from Render

Update `client/src/store/useStore.js` to use the environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

## Features Overview

### ✅ Implemented Features

1. **Dashboard**
   - Real-time sales analytics
   - Revenue charts (7-day trend)
   - Sales by category (pie chart)
   - Pending orders overview
   - Low stock alerts
   - AI-powered recommendations

2. **POS (Point of Sale)**
   - Quick order creation
   - Dynamic menu item selection
   - Category filtering
   - Multiple order types (dine-in, takeout, delivery)
   - Discount application
   - Multiple payment methods (cash, card, digital wallet)
   - Automatic change calculation
   - PDF receipt generation

3. **Menu Management**
   - Full CRUD operations
   - Category organization
   - Price management
   - Availability toggle
   - Search and filter

4. **Order Management**
   - Real-time order tracking
   - Status updates (pending → preparing → ready → completed)
   - Order details view
   - Payment status tracking
   - Receipt download

5. **Inventory Control**
   - Ingredient tracking
   - Stock level monitoring
   - Low stock alerts
   - Restock functionality
   - Auto-decrement on sales

6. **Reports & Analytics**
   - Daily/weekly/monthly reports
   - Revenue trends
   - Top-selling items
   - Sales by category
   - Payment method distribution
   - Category performance metrics

7. **User Management**
   - Role-based access control (Admin, Cashier, Kitchen)
   - User CRUD operations
   - Active/inactive status

8. **Settings**
   - Restaurant information
   - Currency configuration
   - Tax rate settings
   - Contact details
   - Theme preferences

9. **AI Sales Assistant**
   - Time-based suggestions
   - Trending items analysis
   - Combo recommendations
   - Promotion ideas
   - Performance insights

10. **UI/UX Features**
    - Dark mode support
    - Responsive design
    - Modern, clean interface
    - Real-time updates
    - Intuitive navigation

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Zustand, Recharts, Lucide Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT
- **PDF Generation**: PDFKit
- **Charts**: Recharts

## Project Structure

```
caisse-manager/
├── server/
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── Ingredient.js
│   │   └── Settings.js
│   ├── routes/           # API endpoints
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   ├── inventory.js
│   │   ├── payments.js
│   │   ├── reports.js
│   │   ├── settings.js
│   │   └── ai.js
│   ├── middleware/       # Auth middleware
│   │   └── auth.js
│   └── index.js          # Server entry
├── client/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   └── Layout.jsx
│   │   ├── pages/        # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── POS.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Users.jsx
│   │   ├── store/        # State management
│   │   │   └── useStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── package.json
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for Atlas)

### Port Already in Use
- Change PORT in `.env`
- Kill process using the port: `lsof -ti:5000 | xargs kill -9`

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## Support

For issues or questions, check the README.md or create an issue in the repository.

## License

MIT License - feel free to use for personal or commercial projects.

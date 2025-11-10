# Caisse Manager Pro 🍽️

A modern, smart POS (Point of Sale) system designed for restaurants and cafés.

## Features

- 📊 **Dashboard**: Real-time sales overview, top products, and pending orders
- 🛒 **Order Management**: Quick order creation with dynamic menu items
- 🍕 **Menu Management**: Full CRUD operations for food and drinks
- 📦 **Inventory Control**: Track stock levels with auto-decrement
- 💳 **Payment System**: Multiple payment methods with PDF receipts
- 📈 **Reports & Analytics**: Comprehensive sales reports and insights
- 👥 **User Roles**: Admin, Cashier, and Kitchen staff access levels
- ⚙️ **Settings**: Customizable currency, taxes, and branding
- 🤖 **AI Sales Assistant**: Smart recommendations based on sales data

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT
- **UI Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Setup

1. Clone the repository
```bash
cd caisse-manager
```

2. Install dependencies
```bash
npm install
cd client && npm install
cd ..
```

3. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. Start development servers
```bash
npm run dev
```

The backend will run on `http://localhost:5000` and frontend on `http://localhost:5173`

## Default Login Credentials

- **Admin**: admin@caisse.com / admin123
- **Cashier**: cashier@caisse.com / cashier123
- **Kitchen**: kitchen@caisse.com / kitchen123

## Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy the dist folder to Vercel
```

### Backend (Render)
- Connect your repository to Render
- Set environment variables
- Deploy as a Web Service

## Project Structure

```
caisse-manager/
├── server/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & validation
│   ├── controllers/     # Business logic
│   └── index.js         # Server entry
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # State management
│   │   ├── utils/       # Helper functions
│   │   └── App.jsx      # Main app
│   └── public/          # Static assets
└── package.json
```

## License

MIT

# API Documentation - Caisse Manager Pro

Base URL: `http://localhost:5000/api` (development)

## Authentication

All endpoints except `/auth/login` require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login to get JWT token

**Request:**
```json
{
  "email": "admin@caisse.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@caisse.com",
    "role": "admin"
  }
}
```

#### GET /auth/me
Get current user info

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Admin User",
  "email": "admin@caisse.com",
  "role": "admin"
}
```

---

### Users (Admin Only)

#### GET /users
Get all users

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@caisse.com",
    "role": "admin",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /users
Create new user

**Request:**
```json
{
  "name": "New Cashier",
  "email": "cashier@example.com",
  "password": "password123",
  "role": "cashier"
}
```

#### PUT /users/:id
Update user

**Request:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "cashier",
  "active": true
}
```

#### DELETE /users/:id
Delete user

---

### Menu Items

#### GET /menu
Get all menu items

**Query Parameters:**
- `category` - Filter by category
- `available` - Filter by availability (true/false)
- `search` - Search by name or description

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Espresso",
    "category": "Beverages",
    "price": 2.50,
    "description": "Strong Italian coffee",
    "image": "",
    "available": true,
    "ingredients": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /menu/:id
Get single menu item

#### POST /menu
Create menu item (Admin/Cashier)

**Request:**
```json
{
  "name": "Cappuccino",
  "category": "Beverages",
  "price": 3.50,
  "description": "Espresso with steamed milk",
  "available": true
}
```

#### PUT /menu/:id
Update menu item (Admin/Cashier)

#### DELETE /menu/:id
Delete menu item (Admin)

#### GET /menu/categories/list
Get all categories

---

### Orders

#### GET /orders
Get all orders

**Query Parameters:**
- `status` - Filter by status
- `paymentStatus` - Filter by payment status
- `startDate` - Filter from date
- `endDate` - Filter to date

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-20240101-0001",
    "type": "dine-in",
    "tableNumber": "T-12",
    "items": [
      {
        "menuItem": "507f1f77bcf86cd799439011",
        "name": "Espresso",
        "quantity": 2,
        "price": 2.50,
        "subtotal": 5.00
      }
    ],
    "subtotal": 5.00,
    "discount": 0,
    "tax": 1.00,
    "total": 6.00,
    "status": "pending",
    "paymentStatus": "unpaid",
    "paymentMethod": "",
    "cashier": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Cashier User"
    },
    "notes": "",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

#### GET /orders/:id
Get single order

#### POST /orders
Create order (Admin/Cashier)

**Request:**
```json
{
  "type": "dine-in",
  "tableNumber": "T-12",
  "items": [
    {
      "menuItem": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "discount": 0,
  "notes": "No sugar"
}
```

#### PATCH /orders/:id/status
Update order status

**Request:**
```json
{
  "status": "preparing"
}
```

#### PATCH /orders/:id/payment
Update payment status (Admin/Cashier)

**Request:**
```json
{
  "paymentStatus": "paid",
  "paymentMethod": "cash"
}
```

#### GET /orders/today/summary
Get today's order summary

**Response:**
```json
{
  "totalOrders": 25,
  "totalRevenue": 450.00,
  "pendingOrders": 3,
  "completedOrders": 22
}
```

---

### Inventory

#### GET /inventory
Get all ingredients

**Query Parameters:**
- `lowStock` - Filter low stock items (true/false)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Coffee Beans",
    "unit": "kg",
    "currentStock": 5.5,
    "minStock": 10,
    "cost": 25.00,
    "supplier": "Coffee Supplier Inc",
    "lastRestocked": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /inventory/:id
Get single ingredient

#### POST /inventory
Create ingredient (Admin/Cashier)

**Request:**
```json
{
  "name": "Milk",
  "unit": "l",
  "currentStock": 20,
  "minStock": 10,
  "cost": 2.50,
  "supplier": "Dairy Farm"
}
```

#### PUT /inventory/:id
Update ingredient (Admin/Cashier)

#### PATCH /inventory/:id/restock
Restock ingredient (Admin/Cashier)

**Request:**
```json
{
  "quantity": 10
}
```

#### DELETE /inventory/:id
Delete ingredient (Admin)

---

### Payments

#### POST /payments/:orderId
Process payment (Admin/Cashier)

**Request:**
```json
{
  "paymentMethod": "cash",
  "amountPaid": 10.00
}
```

**Response:**
```json
{
  "message": "Payment processed successfully",
  "order": { /* order object */ },
  "change": 4.00
}
```

#### GET /payments/:orderId/receipt
Download PDF receipt

---

### Reports

#### GET /reports/sales
Get sales report (Admin/Cashier)

**Query Parameters:**
- `period` - today, week, month, custom
- `startDate` - For custom period
- `endDate` - For custom period

**Response:**
```json
{
  "period": {
    "start": "2024-01-01T00:00:00.000Z",
    "end": "2024-01-01T23:59:59.999Z"
  },
  "summary": {
    "totalRevenue": 450.00,
    "totalOrders": 25,
    "averageOrderValue": 18.00
  },
  "categoryStats": {
    "Beverages": {
      "revenue": 200.00,
      "quantity": 50
    },
    "Food": {
      "revenue": 250.00,
      "quantity": 30
    }
  },
  "topItems": [
    {
      "name": "Espresso",
      "quantity": 30,
      "revenue": 75.00
    }
  ],
  "paymentMethods": {
    "cash": {
      "count": 15,
      "revenue": 270.00
    },
    "card": {
      "count": 10,
      "revenue": 180.00
    }
  }
}
```

#### GET /reports/daily-revenue
Get daily revenue chart data (Admin/Cashier)

**Query Parameters:**
- `days` - Number of days (default: 7)

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "revenue": 450.00,
    "orders": 25
  },
  {
    "date": "2024-01-02",
    "revenue": 520.00,
    "orders": 28
  }
]
```

---

### Settings

#### GET /settings
Get settings

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "restaurantName": "Caisse Manager Pro",
  "currency": "EUR",
  "taxRate": 20,
  "logo": "",
  "theme": "light",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "contact@restaurant.com",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /settings
Update settings (Admin)

**Request:**
```json
{
  "restaurantName": "My Restaurant",
  "currency": "USD",
  "taxRate": 15,
  "address": "456 New St",
  "phone": "+0987654321",
  "email": "info@myrestaurant.com"
}
```

---

### AI Recommendations

#### GET /ai/recommendations
Get AI-powered sales recommendations

**Response:**
```json
{
  "timeBasedSuggestion": "Morning rush - Promote breakfast combos",
  "suggestedCategory": "Beverages",
  "trendingItems": [
    {
      "name": "Espresso",
      "count": 30,
      "revenue": 75.00
    }
  ],
  "recommendedCombos": [
    {
      "combo": "Espresso + Croissant",
      "count": 12
    }
  ],
  "insights": {
    "todayRevenue": "450.00",
    "avgDailyRevenue": "420.00",
    "performanceVsAverage": "7.1%",
    "totalOrdersToday": 25
  },
  "promotionIdeas": [
    "Create a 'Beverages Special' for this time of day",
    "Offer combo deal: Espresso + Croissant",
    "Feature 'Espresso' as today's special"
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "message": "No authentication token, access denied"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Something went wrong!",
  "error": "Error details"
}
```

---

## Role Permissions

### Admin
- Full access to all endpoints
- User management
- Settings configuration
- All CRUD operations

### Cashier
- POS operations
- Order management
- Menu management (create, update)
- Inventory management
- Reports viewing
- Payment processing

### Kitchen
- View orders
- Update order status
- View menu items
- Limited access

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

---

## Webhooks (Future Enhancement)

Potential webhook events:
- `order.created`
- `order.completed`
- `payment.processed`
- `inventory.low_stock`

---

## Testing

Use tools like Postman or curl to test the API:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@caisse.com","password":"admin123"}'

# Get menu items (with token)
curl http://localhost:5000/api/menu \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "dine-in",
    "tableNumber": "T-1",
    "items": [{"menuItem": "MENU_ITEM_ID", "quantity": 2}],
    "discount": 0
  }'
```

---

## Best Practices

1. **Always use HTTPS in production**
2. **Validate input data**
3. **Handle errors gracefully**
4. **Use pagination for large datasets**
5. **Implement caching where appropriate**
6. **Log all API requests**
7. **Monitor API performance**
8. **Version your API** (e.g., /api/v1/)

---

## Support

For API issues or questions, refer to the main README.md or create an issue in the repository.

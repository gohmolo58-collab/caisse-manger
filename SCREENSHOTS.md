# Caisse Manager Pro - Visual Guide

## 🎨 Application Screens Overview

This document describes what each screen looks like and its functionality.

---

## 1. Login Screen

**Design:**
- Gradient background (orange to darker orange)
- Centered white card with rounded corners
- Coffee cup icon at the top
- Clean, modern login form
- Quick login buttons for demo (Admin, Cashier, Kitchen)

**Features:**
- Email and password inputs
- Remember me option
- Error messages display
- Loading state during login
- Responsive design

**Colors:**
- Background: Orange gradient (#f97316 to #ea580c)
- Card: White with shadow
- Buttons: Primary orange
- Text: Dark gray

---

## 2. Dashboard (Main Screen)

**Layout:**
- Sidebar on the left (collapsible)
- Main content area on the right
- Top section with greeting and stats

**Key Sections:**

### Stats Cards (4 cards in a row)
1. **Today's Revenue** - Orange icon, shows total with trend
2. **Total Orders** - Blue icon, shows count
3. **Pending Orders** - Yellow icon, needs attention
4. **Avg Order Value** - Green icon, per transaction

### Charts Row (2 charts side by side)
1. **7-Day Revenue Trend** - Line chart, orange line
2. **Sales by Category** - Pie chart, colorful segments

### AI Recommendations Card
- Gradient background (orange tint)
- Sparkles icon
- Time-based suggestions
- Trending items
- Promotion ideas

### Low Stock Alerts
- Red alert icon
- List of items running low
- Status badges

### Recent Orders Table
- Clean table layout
- Order numbers, types, totals
- Status badges (colored)

**Colors:**
- Cards: White with subtle shadows
- Charts: Orange primary, blue, green accents
- Alerts: Red for warnings
- Success: Green indicators

---

## 3. POS (Point of Sale) Screen

**Layout:**
- Split screen design
- Left: Menu items grid (70%)
- Right: Cart and checkout (30%)

**Left Side - Menu:**
- Search bar at top
- Category filter buttons (horizontal scroll)
- Grid of menu items (4 columns)
- Each item shows:
  - Image placeholder or emoji
  - Name
  - Description
  - Price in large text

**Right Side - Cart:**
- Order type selector (3 buttons)
- Table number input (for dine-in)
- Cart items list with:
  - Item name and price
  - Quantity controls (+/-)
  - Remove button
- Discount input
- Totals breakdown:
  - Subtotal
  - Discount (if any)
  - Tax
  - Total (large, bold)
- Clear and Checkout buttons

**Payment Modal:**
- Large total display
- Payment method icons (Cash, Card, Wallet)
- Amount paid input (for cash)
- Change calculation
- Complete payment button

**Colors:**
- Menu items: White cards with hover effect
- Selected category: Orange
- Cart: Light gray background
- Totals: Orange for final amount

---

## 4. Menu Management Screen

**Layout:**
- Header with title and "Add Item" button
- Search and filter bar
- Grid of menu items (4 columns)

**Menu Item Cards:**
- Large image area (placeholder or actual image)
- Item name and availability badge
- Description text
- Category label
- Price (large, orange)
- Edit and Delete buttons

**Add/Edit Modal:**
- Form with fields:
  - Name
  - Category dropdown
  - Price
  - Description textarea
  - Available checkbox
- Cancel and Save buttons

**Colors:**
- Available badge: Green
- Unavailable badge: Red
- Edit button: Gray
- Delete button: Red

---

## 5. Orders Screen

**Layout:**
- Header with title
- Filter buttons (all, pending, preparing, ready, completed, cancelled)
- List of order cards

**Order Cards:**
- Order number and date
- Type and table number
- Status badges (colored)
- Payment status badge
- Items list with quantities
- Total amount (large, orange)
- Status dropdown (if editable)
- View and Receipt buttons

**Order Details Modal:**
- Full order information
- Item breakdown
- Totals calculation
- Customer notes
- Timeline of status changes

**Colors:**
- Pending: Yellow
- Preparing: Blue
- Ready: Green
- Completed: Gray
- Cancelled: Red
- Paid: Green
- Unpaid: Red

---

## 6. Inventory Screen

**Layout:**
- Header with "Add Ingredient" button
- Low stock alert banner (if applicable)
- Table of ingredients

**Table Columns:**
- Ingredient name with icon
- Current stock (red if low)
- Min stock
- Unit
- Cost
- Supplier
- Status badge
- Actions (Restock, Edit)

**Restock Modal:**
- Current stock display
- Quantity to add input
- New stock level preview
- Confirm button

**Colors:**
- Low stock: Red text and badges
- In stock: Green badges
- Restock button: Orange

---

## 7. Reports & Analytics Screen

**Layout:**
- Period selector (Today, Week, Month)
- Summary cards (3 cards)
- Charts section (2 charts)
- Top selling items table
- Category performance cards

**Summary Cards:**
- Total Revenue
- Total Orders
- Average Order Value

**Charts:**
1. **Sales by Category** - Bar chart
2. **Payment Methods** - Pie chart

**Top Items Table:**
- Rank (with medal icons for top 3)
- Item name
- Quantity sold
- Revenue

**Category Cards:**
- Category name with color dot
- Revenue amount
- Items sold count

**Colors:**
- Charts: Orange, blue, green, yellow, purple
- Top 3 ranks: Gold, silver, bronze
- Cards: White with colored accents

---

## 8. Settings Screen

**Layout:**
- Simple form layout
- Sections with cards

**Sections:**
1. **Restaurant Information**
   - Name, address, phone, email

2. **Financial Settings**
   - Currency dropdown
   - Tax rate input
   - Info note

3. **Appearance**
   - Theme selector

**Save Button:**
- Orange, at bottom
- Success message on save

---

## 9. Users Management Screen (Admin Only)

**Layout:**
- Header with "Add User" button
- Table of users

**Table Columns:**
- Avatar circle with initial
- Name
- Email
- Role badge (colored by role)
- Status badge (active/inactive)
- Created date
- Edit and Delete actions

**Add/Edit User Modal:**
- Name input
- Email input
- Password input (for new users)
- Role dropdown
- Active checkbox
- Role description text

**Colors:**
- Admin badge: Purple
- Cashier badge: Blue
- Kitchen badge: Green
- Active: Green
- Inactive: Red

---

## Sidebar Navigation

**Always Visible:**
- Restaurant logo/name at top
- Collapsible toggle button
- Navigation menu items with icons
- User profile section at bottom
- Dark mode toggle
- Logout button

**Menu Items:**
- Dashboard
- POS
- Menu
- Orders
- Inventory
- Reports
- Users (admin only)
- Settings (admin only)

**Active State:**
- Orange background
- Orange left border
- Bold text

---

## Dark Mode

**All screens support dark mode with:**
- Dark background (#0f172a)
- Dark cards (#1e293b)
- Light text on dark background
- Adjusted colors for better contrast
- Same layout and functionality
- Smooth transition between modes

**Toggle:**
- Sun/Moon icon in sidebar
- Instant theme switch
- Preference saved to localStorage

---

## Responsive Design

### Mobile (< 768px)
- Sidebar collapses to hamburger menu
- Single column layouts
- Stacked cards
- Touch-friendly buttons
- Optimized spacing

### Tablet (768px - 1024px)
- 2 column grids
- Sidebar visible
- Adjusted spacing
- Optimized for touch

### Desktop (> 1024px)
- Full layout as designed
- 3-4 column grids
- All features visible
- Optimal spacing

---

## Color Palette

### Light Mode:
- **Primary**: #f97316 (Orange)
- **Background**: #f9fafb (Light gray)
- **Cards**: #ffffff (White)
- **Text**: #111827 (Dark gray)
- **Borders**: #e5e7eb (Light gray)

### Dark Mode:
- **Primary**: #f97316 (Orange)
- **Background**: #0f172a (Dark blue-gray)
- **Cards**: #1e293b (Lighter dark)
- **Text**: #f9fafb (Light)
- **Borders**: #334155 (Dark gray)

### Status Colors:
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Yellow)
- **Error**: #ef4444 (Red)
- **Info**: #3b82f6 (Blue)

---

## Icons

Using **Lucide React** icons throughout:
- Clean, modern line icons
- Consistent style
- 20px default size
- Colored to match context

**Common Icons:**
- Dashboard: LayoutDashboard
- POS: ShoppingCart
- Menu: UtensilsCrossed
- Orders: ClipboardList
- Inventory: Package
- Reports: BarChart3
- Settings: Settings
- Users: Users
- Logout: LogOut
- Search: Search
- Edit: Edit
- Delete: Trash2
- Add: Plus

---

## Typography

**Font Family:**
- System fonts for best performance
- Sans-serif stack

**Sizes:**
- Headings: 2xl, xl, lg
- Body: base (16px)
- Small: sm (14px)
- Tiny: xs (12px)

**Weights:**
- Bold: 700 (headings, important)
- Semibold: 600 (labels)
- Medium: 500 (buttons)
- Regular: 400 (body text)

---

## Animations & Transitions

**Smooth transitions on:**
- Hover effects (200ms)
- Theme switching
- Modal open/close
- Sidebar collapse
- Button states
- Chart animations

**Loading States:**
- Spinner for async operations
- Skeleton screens ready
- Progress indicators

---

## User Experience Highlights

1. **Intuitive Navigation** - Clear menu structure
2. **Fast Actions** - Quick access to common tasks
3. **Visual Feedback** - Clear status indicators
4. **Error Handling** - Friendly error messages
5. **Responsive** - Works on all devices
6. **Accessible** - Keyboard navigation ready
7. **Modern** - Clean, contemporary design
8. **Professional** - Business-ready appearance

---

## Summary

The application features a **modern, clean, and professional design** with:
- Warm restaurant color palette (orange/beige)
- Consistent spacing and typography
- Clear visual hierarchy
- Intuitive user interface
- Responsive across all devices
- Full dark mode support
- Smooth animations
- Professional appearance

Perfect for restaurant and café management! 🍽️

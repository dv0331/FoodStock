# 🍽️ FoodStock - Restaurant & Food Truck Inventory Management

A beautiful, modern, and responsive inventory management system designed specifically for restaurants and food trucks. Built with Next.js and featuring a stunning UI that works seamlessly on phones, tablets, and laptops.

![FoodStock Preview](preview.png)

## ✨ Features

### 📊 Dashboard
- Real-time inventory overview
- Visual charts for category distribution
- Quick stats (total items, inventory value, alerts)
- Low stock and expiration warnings at a glance

### 📦 Inventory Management
- Add, edit, and delete inventory items
- Track quantities with quick +/- adjustments
- Organize items by categories (Proteins, Vegetables, Dairy, etc.)
- Set minimum stock levels for automatic alerts
- Track expiration dates for perishable items
- Link items to suppliers for easy reordering

### ⚠️ Smart Alerts
- Low stock notifications
- Expiring soon warnings (7 days)
- Expired item alerts
- Filterable alert views

### 👥 Supplier Management
- Store supplier contact information
- Track which items come from each supplier
- Quick access to phone and email

### 📈 Reports & Analytics
- Stock health overview
- Category breakdown with values
- Supplier analysis
- Top items by value
- Visual charts and graphs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd FoodStock
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

## 📱 Responsive Design

FoodStock is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops and desktops

## 🎨 Tech Stack

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **State Management:** React Context API
- **Storage:** LocalStorage (persists data locally)

## 📁 Project Structure

```
FoodStock/
├── app/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── PageWrapper.js
│   │   └── Sidebar.js
│   ├── context/
│   │   └── InventoryContext.js
│   ├── alerts/
│   │   └── page.js
│   ├── inventory/
│   │   └── page.js
│   ├── reports/
│   │   └── page.js
│   ├── suppliers/
│   │   └── page.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── package.json
├── tailwind.config.js
└── README.md
```

## 💡 Usage Tips

### Adding Inventory Items
1. Go to the Inventory page
2. Click "Add Item"
3. Fill in the details:
   - Item name
   - Category
   - Quantity and unit
   - Minimum stock level (for alerts)
   - Cost per unit
   - Expiration date (for perishables)
   - Supplier (optional)

### Managing Stock Levels
- Use the +/- buttons on each item for quick adjustments
- Items below minimum stock will trigger low stock alerts

### Setting Up Suppliers
1. Go to the Suppliers page
2. Add your vendors with contact information
3. Link inventory items to suppliers when adding/editing

### Monitoring Alerts
- The sidebar shows a badge with active alert count
- Check the Alerts page for detailed information
- Filter by alert type (Low Stock, Expiring, Expired)

## 🔒 Data Storage

All data is stored locally in your browser using LocalStorage. Your inventory data persists across sessions but is specific to your browser/device.

**Note:** Clearing browser data will reset all inventory information.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

Made with ❤️ for the food service industry


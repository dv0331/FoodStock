# 🍳 FoodStock - Restaurant Inventory Management System

A modern, responsive inventory management system built for restaurants and food trucks. Manage your stock, track expiration dates, and never run out of essential ingredients.

![FoodStock](https://img.shields.io/badge/Next.js-14-black) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 📊 Dashboard
- Real-time inventory overview with key stats
- Interactive charts for category distribution
- Low stock and expiring items at a glance
- Quick action buttons for common tasks

### 📦 Inventory Management
- Full CRUD operations (Add, Edit, Delete items)
- **📷 Camera capture** - Take photos of products directly
- **📱 Barcode/QR scanning** - Scan product barcodes with your camera
- Quick +/- buttons to adjust quantities
- Search and filter by category
- Tracks: name, category, quantity, unit, cost, expiration, supplier

### 📦 Enhanced Units System
- **Container units**: Cases, Cans, Boxes, Bottles, Jars, Cartons, etc.
- **Weight units**: Pounds, Kilograms, Ounces, Grams
- **Volume units**: Gallons, Liters, Quarts, Cups
- **Bulk packs**: 6-pack, 12-pack, 24-pack, #10 cans
- **Case tracking**: Track cases with units per case (e.g., 24 cans per case)

### 👥 Multi-User Support
- Add multiple team members
- Role-based access (Admin, Manager, Staff)
- User management dashboard
- Activity tracking per user

### ⚠️ Smart Alerts
- Low Stock warnings
- Expiring Soon alerts (within 7 days)
- Expired items tracking
- Badge counter in navigation

### 👥 Supplier Management
- Store supplier contacts
- Track delivery schedules
- Link items to suppliers

### 📈 Reports & Analytics
- Stock health overview
- Value by category breakdown
- Top items by value
- Supplier analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dv0331/FoodStock.git
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

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Mobile Features

The app is fully responsive and works on:
- 📱 Mobile phones (with hamburger menu)
- 📱 Tablets
- 💻 Laptops and desktops

### Camera & Scanner
- **Take Photos**: Capture product images using your device camera
- **Scan Barcodes**: Use your camera to scan product barcodes
- **Manual Entry**: Enter barcodes manually if scanning isn't available

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Barcode Scanning**: html5-qrcode
- **Storage**: LocalStorage (persistent)

## 📁 Project Structure

```
FoodStock/
├── app/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   ├── Input.js
│   │   │   ├── Select.js
│   │   │   ├── CameraCapture.js
│   │   │   └── BarcodeScanner.js
│   │   ├── Sidebar.js
│   │   └── PageWrapper.js
│   ├── context/
│   │   └── InventoryContext.js
│   ├── alerts/page.js
│   ├── inventory/page.js
│   ├── reports/page.js
│   ├── suppliers/page.js
│   ├── users/page.js
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── public/
├── tailwind.config.js
├── next.config.js
└── package.json
```

## 🎨 Design Features

- Modern sage green & orange color scheme
- Smooth animations and transitions
- Glassmorphism effects
- Food-related emojis for categories
- Beautiful charts and visualizations

## 📝 License

MIT License - feel free to use this project for your restaurant or food truck!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for restaurant and food truck owners

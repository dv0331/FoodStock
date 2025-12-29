'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const InventoryContext = createContext()

// Default categories for restaurant/food truck
const defaultCategories = [
  { id: '1', name: 'Proteins', icon: '🥩', color: '#ef4444' },
  { id: '2', name: 'Vegetables', icon: '🥬', color: '#22c55e' },
  { id: '3', name: 'Dairy', icon: '🧀', color: '#fbbf24' },
  { id: '4', name: 'Grains', icon: '🌾', color: '#f59e0b' },
  { id: '5', name: 'Sauces & Condiments', icon: '🫙', color: '#8b5cf6' },
  { id: '6', name: 'Beverages', icon: '🥤', color: '#06b6d4' },
  { id: '7', name: 'Spices', icon: '🌶️', color: '#dc2626' },
  { id: '8', name: 'Frozen', icon: '🧊', color: '#3b82f6' },
  { id: '9', name: 'Packaging', icon: '📦', color: '#78716c' },
  { id: '10', name: 'Other', icon: '📋', color: '#64748b' },
]

// Sample inventory data
const sampleInventory = [
  { id: uuidv4(), name: 'Ground Beef', category: '1', quantity: 25, unit: 'lbs', minStock: 10, costPerUnit: 5.99, expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '1', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'Chicken Breast', category: '1', quantity: 30, unit: 'lbs', minStock: 15, costPerUnit: 4.49, expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '1', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'Lettuce', category: '2', quantity: 8, unit: 'heads', minStock: 10, costPerUnit: 2.99, expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '2', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'Tomatoes', category: '2', quantity: 40, unit: 'lbs', minStock: 20, costPerUnit: 1.99, expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '2', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'Cheddar Cheese', category: '3', quantity: 15, unit: 'lbs', minStock: 8, costPerUnit: 6.99, expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '3', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'Burger Buns', category: '4', quantity: 48, unit: 'pcs', minStock: 24, costPerUnit: 0.50, expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '4', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'Ketchup', category: '5', quantity: 4, unit: 'gal', minStock: 2, costPerUnit: 8.99, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '3', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'Mayonnaise', category: '5', quantity: 3, unit: 'gal', minStock: 2, costPerUnit: 9.99, expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '3', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'Cola', category: '6', quantity: 5, unit: 'cases', minStock: 3, costPerUnit: 18.99, expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '5', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'French Fries', category: '8', quantity: 50, unit: 'lbs', minStock: 25, costPerUnit: 2.49, expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], supplier: '3', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'To-Go Containers', category: '9', quantity: 200, unit: 'pcs', minStock: 100, costPerUnit: 0.25, expirationDate: null, supplier: '6', lastUpdated: new Date().toISOString() },
  { id: uuidv4(), name: 'Salt', category: '7', quantity: 5, unit: 'lbs', minStock: 2, costPerUnit: 1.99, expirationDate: null, supplier: '3', lastUpdated: new Date().toISOString() },
]

// Sample suppliers
const sampleSuppliers = [
  { id: '1', name: 'Fresh Meats Co.', contact: 'John Smith', phone: '(555) 123-4567', email: 'orders@freshmeats.com', address: '123 Butcher Lane', notes: 'Delivers Mon-Wed-Fri' },
  { id: '2', name: 'Green Valley Farms', contact: 'Sarah Green', phone: '(555) 234-5678', email: 'produce@greenvalley.com', address: '456 Farm Road', notes: 'Fresh organic produce' },
  { id: '3', name: 'Sysco Foods', contact: 'Mike Johnson', phone: '(555) 345-6789', email: 'orders@sysco.com', address: '789 Distribution Way', notes: 'Weekly delivery schedule' },
  { id: '4', name: 'Local Bakery', contact: 'Maria Garcia', phone: '(555) 456-7890', email: 'orders@localbakery.com', address: '321 Baker Street', notes: 'Daily fresh buns' },
  { id: '5', name: 'Beverage World', contact: 'Tom Brown', phone: '(555) 567-8901', email: 'sales@bevworld.com', address: '654 Drink Avenue', notes: 'Bi-weekly delivery' },
  { id: '6', name: 'PackageRight', contact: 'Lisa White', phone: '(555) 678-9012', email: 'orders@packageright.com', address: '987 Box Boulevard', notes: 'Eco-friendly packaging' },
]

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState(defaultCategories)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInventory = localStorage.getItem('foodstock_inventory')
    const savedSuppliers = localStorage.getItem('foodstock_suppliers')
    
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory))
    } else {
      setInventory(sampleInventory)
    }
    
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers))
    } else {
      setSuppliers(sampleSuppliers)
    }
    
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('foodstock_inventory', JSON.stringify(inventory))
    }
  }, [inventory, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('foodstock_suppliers', JSON.stringify(suppliers))
    }
  }, [suppliers, isLoaded])

  // Inventory CRUD operations
  const addItem = (item) => {
    const newItem = {
      ...item,
      id: uuidv4(),
      lastUpdated: new Date().toISOString(),
    }
    setInventory(prev => [...prev, newItem])
    return newItem
  }

  const updateItem = (id, updates) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, lastUpdated: new Date().toISOString() } 
          : item
      )
    )
  }

  const deleteItem = (id) => {
    setInventory(prev => prev.filter(item => item.id !== id))
  }

  const adjustQuantity = (id, adjustment) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === id
          ? { 
              ...item, 
              quantity: Math.max(0, item.quantity + adjustment),
              lastUpdated: new Date().toISOString()
            }
          : item
      )
    )
  }

  // Supplier CRUD operations
  const addSupplier = (supplier) => {
    const newSupplier = {
      ...supplier,
      id: uuidv4(),
    }
    setSuppliers(prev => [...prev, newSupplier])
    return newSupplier
  }

  const updateSupplier = (id, updates) => {
    setSuppliers(prev =>
      prev.map(supplier =>
        supplier.id === id ? { ...supplier, ...updates } : supplier
      )
    )
  }

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id))
  }

  // Computed values
  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.minStock)
  }

  const getExpiringItems = (days = 7) => {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() + days)
    
    return inventory.filter(item => {
      if (!item.expirationDate) return false
      const expDate = new Date(item.expirationDate)
      return expDate <= threshold && expDate >= new Date()
    })
  }

  const getExpiredItems = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return inventory.filter(item => {
      if (!item.expirationDate) return false
      return new Date(item.expirationDate) < today
    })
  }

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => {
      return total + (item.quantity * item.costPerUnit)
    }, 0)
  }

  const getItemsByCategory = (categoryId) => {
    return inventory.filter(item => item.category === categoryId)
  }

  const getCategoryStats = () => {
    return categories.map(cat => ({
      ...cat,
      itemCount: inventory.filter(item => item.category === cat.id).length,
      totalValue: inventory
        .filter(item => item.category === cat.id)
        .reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0)
    }))
  }

  const getSupplierById = (id) => {
    return suppliers.find(s => s.id === id)
  }

  const getCategoryById = (id) => {
    return categories.find(c => c.id === id)
  }

  const value = {
    inventory,
    suppliers,
    categories,
    isLoaded,
    addItem,
    updateItem,
    deleteItem,
    adjustQuantity,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getLowStockItems,
    getExpiringItems,
    getExpiredItems,
    getTotalInventoryValue,
    getItemsByCategory,
    getCategoryStats,
    getSupplierById,
    getCategoryById,
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}


'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  Calendar,
  ChevronRight,
  Clock,
  Truck
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import Link from 'next/link'
import PageWrapper from './components/PageWrapper'
import Card from './components/ui/Card'
import { useInventory } from './context/InventoryContext'
import { format, differenceInDays } from 'date-fns'

function DashboardContent() {
  const { 
    inventory, 
    suppliers,
    categories,
    getLowStockItems, 
    getExpiringItems,
    getExpiredItems,
    getTotalInventoryValue,
    getCategoryStats,
    isLoaded 
  } = useInventory()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const lowStockItems = getLowStockItems()
  const expiringItems = getExpiringItems(7)
  const expiredItems = getExpiredItems()
  const totalValue = getTotalInventoryValue()
  const categoryStats = getCategoryStats()

  // Stats cards data
  const stats = [
    {
      label: 'Total Items',
      value: inventory.length,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Inventory Value',
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      urgent: lowStockItems.length > 0
    },
    {
      label: 'Expiring Soon',
      value: expiringItems.length,
      icon: Calendar,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      urgent: expiringItems.length > 0
    },
  ]

  // Prepare chart data
  const categoryChartData = categoryStats
    .filter(cat => cat.itemCount > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.totalValue,
      icon: cat.icon,
      color: cat.color
    }))

  const COLORS = categoryStats.map(c => c.color)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-3xl font-bold text-sage-900">Dashboard</h1>
        <p className="text-sage-500 mt-1">Welcome back! Here's your inventory overview.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className={`relative overflow-hidden ${stat.urgent ? 'ring-2 ring-red-400' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-sage-500 font-medium">{stat.label}</p>
                  <p className="mt-2 text-3xl font-display font-bold text-sage-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              {stat.urgent && (
                <div className="absolute top-0 right-0 w-3 h-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-sage-900 mb-6">
            Inventory by Category
          </h3>
          <div className="h-64">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sage-400">
                No inventory data yet
              </div>
            )}
          </div>
        </Card>

        {/* Category Values Bar Chart */}
        <Card>
          <h3 className="font-display text-lg font-semibold text-sage-900 mb-6">
            Category Values
          </h3>
          <div className="h-64">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e6dc" />
                  <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 4, 4, 0]}
                    fill="#ee751b"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sage-400">
                No inventory data yet
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Alerts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-sage-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Items
            </h3>
            <Link href="/alerts" className="text-brand-500 text-sm font-medium hover:text-brand-600 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {lowStockItems.slice(0, 5).map(item => {
              const category = categories.find(c => c.id === item.category)
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category?.icon || '📦'}</span>
                    <div>
                      <p className="font-medium text-sage-900">{item.name}</p>
                      <p className="text-sm text-sage-500">
                        Min: {item.minStock} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">
                      {item.quantity} {item.unit}
                    </p>
                    <p className="text-xs text-sage-500">remaining</p>
                  </div>
                </div>
              )
            })}
            {lowStockItems.length === 0 && (
              <div className="text-center py-8 text-sage-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>All items are well-stocked! 🎉</p>
              </div>
            )}
          </div>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-sage-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              Expiring Soon
            </h3>
            <Link href="/alerts" className="text-brand-500 text-sm font-medium hover:text-brand-600 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {expiringItems.slice(0, 5).map(item => {
              const category = categories.find(c => c.id === item.category)
              const daysUntilExpiry = differenceInDays(new Date(item.expirationDate), new Date())
              return (
                <div 
                  key={item.id}
                  className={`
                    flex items-center justify-between p-3 rounded-xl border
                    ${daysUntilExpiry <= 2 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-orange-50 border-orange-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category?.icon || '📦'}</span>
                    <div>
                      <p className="font-medium text-sage-900">{item.name}</p>
                      <p className="text-sm text-sage-500">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${daysUntilExpiry <= 2 ? 'text-red-600' : 'text-orange-600'}`}>
                      {daysUntilExpiry === 0 
                        ? 'Today!' 
                        : daysUntilExpiry === 1 
                          ? 'Tomorrow' 
                          : `${daysUntilExpiry} days`
                      }
                    </p>
                    <p className="text-xs text-sage-500">
                      {format(new Date(item.expirationDate), 'MMM d')}
                    </p>
                  </div>
                </div>
              )
            })}
            {expiringItems.length === 0 && (
              <div className="text-center py-8 text-sage-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No items expiring soon! 👍</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="font-display text-lg font-semibold text-sage-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/inventory">
              <div className="p-4 rounded-xl bg-brand-50 hover:bg-brand-100 transition-colors text-center cursor-pointer">
                <Package className="w-8 h-8 mx-auto mb-2 text-brand-600" />
                <p className="font-medium text-sage-900">Add Item</p>
              </div>
            </Link>
            <Link href="/suppliers">
              <div className="p-4 rounded-xl bg-sage-100 hover:bg-sage-200 transition-colors text-center cursor-pointer">
                <Truck className="w-8 h-8 mx-auto mb-2 text-sage-600" />
                <p className="font-medium text-sage-900">Add Supplier</p>
              </div>
            </Link>
            <Link href="/alerts">
              <div className="p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-center cursor-pointer">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                <p className="font-medium text-sage-900">View Alerts</p>
              </div>
            </Link>
            <Link href="/reports">
              <div className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-center cursor-pointer">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium text-sage-900">Reports</p>
              </div>
            </Link>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default function Dashboard() {
  return (
    <PageWrapper>
      <DashboardContent />
    </PageWrapper>
  )
}


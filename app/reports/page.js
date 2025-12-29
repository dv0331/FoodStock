'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  AlertTriangle,
  PieChart as PieChartIcon,
  Download,
  Calendar
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
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useInventory } from '../context/InventoryContext'
import { format, subDays } from 'date-fns'

function ReportsContent() {
  const { 
    inventory, 
    categories, 
    suppliers,
    getLowStockItems,
    getExpiringItems,
    getTotalInventoryValue,
    getCategoryStats,
    isLoaded 
  } = useInventory()

  const [selectedReport, setSelectedReport] = useState('overview')

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const categoryStats = getCategoryStats()
  const totalValue = getTotalInventoryValue()
  const lowStockItems = getLowStockItems()
  const expiringItems = getExpiringItems(7)

  // Calculate statistics
  const totalItems = inventory.length
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0)
  const avgItemValue = totalItems > 0 ? totalValue / totalItems : 0
  const lowStockPercentage = totalItems > 0 ? (lowStockItems.length / totalItems) * 100 : 0

  // Category chart data
  const categoryChartData = categoryStats
    .filter(cat => cat.itemCount > 0)
    .sort((a, b) => b.totalValue - a.totalValue)
    .map(cat => ({
      name: cat.name,
      items: cat.itemCount,
      value: cat.totalValue,
      icon: cat.icon,
      color: cat.color
    }))

  // Supplier distribution data
  const supplierData = suppliers.map(sup => {
    const items = inventory.filter(item => item.supplier === sup.id)
    return {
      name: sup.name,
      items: items.length,
      value: items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0)
    }
  }).filter(s => s.items > 0).sort((a, b) => b.value - a.value)

  // Stock health data
  const stockHealthData = [
    { 
      name: 'Healthy', 
      value: inventory.filter(item => item.quantity > item.minStock).length,
      color: '#22c55e'
    },
    { 
      name: 'Low Stock', 
      value: lowStockItems.length,
      color: '#f59e0b'
    },
    { 
      name: 'Expiring', 
      value: expiringItems.length,
      color: '#ef4444'
    },
  ].filter(d => d.value > 0)

  // Top items by value
  const topItemsByValue = [...inventory]
    .sort((a, b) => (b.quantity * b.costPerUnit) - (a.quantity * a.costPerUnit))
    .slice(0, 10)
    .map(item => ({
      name: item.name,
      value: item.quantity * item.costPerUnit,
      quantity: item.quantity,
      unit: item.unit
    }))

  // Inventory value by category (for bar chart)
  const valueByCategory = categoryStats
    .filter(cat => cat.totalValue > 0)
    .map(cat => ({
      name: cat.name.length > 10 ? cat.name.substring(0, 10) + '...' : cat.name,
      value: cat.totalValue
    }))

  const reportTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: PieChartIcon },
    { id: 'suppliers', label: 'Suppliers', icon: Package },
    { id: 'top-items', label: 'Top Items', icon: TrendingUp },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-sage-100">
          <p className="font-medium text-sage-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('Value') || entry.dataKey === 'value' 
                ? `$${entry.value.toFixed(2)}` 
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-sage-900">Reports</h1>
          <p className="text-sage-500 mt-1">Analyze your inventory data</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-sage-500">
          <Calendar className="w-4 h-4" />
          Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-sage-500">Total Items</p>
              <p className="text-2xl font-bold text-sage-900">{totalItems}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-sage-500">Total Value</p>
              <p className="text-2xl font-bold text-sage-900">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-sage-500">Avg. Item Value</p>
              <p className="text-2xl font-bold text-sage-900">${avgItemValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-sage-500">Low Stock Rate</p>
              <p className="text-2xl font-bold text-sage-900">{lowStockPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Report Tabs */}
      <motion.div variants={itemVariants}>
        <Card padding="sm">
          <div className="flex flex-wrap gap-2">
            {reportTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                  ${selectedReport === tab.id 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' 
                    : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Health */}
          <Card>
            <h3 className="font-display text-lg font-semibold text-sage-900 mb-4">
              Stock Health
            </h3>
            <div className="h-64">
              {stockHealthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockHealthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {stockHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sage-400">
                  No data available
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {stockHealthData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-sage-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Value by Category */}
          <Card>
            <h3 className="font-display text-lg font-semibold text-sage-900 mb-4">
              Value by Category
            </h3>
            <div className="h-64">
              {valueByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={valueByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3e6dc" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#ee751b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sage-400">
                  No data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {selectedReport === 'categories' && (
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <h3 className="font-display text-lg font-semibold text-sage-900 mb-6">
              Category Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sage-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-sage-600">Category</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-sage-600">Items</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-sage-600">Total Value</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-sage-600">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {categoryChartData.map(cat => (
                    <tr key={cat.name} className="hover:bg-sage-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="font-medium text-sage-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sage-700">{cat.items}</td>
                      <td className="py-3 px-4 text-right font-medium text-sage-900">
                        ${cat.value.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-sage-600">
                        {((cat.value / totalValue) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-sage-50 font-semibold">
                    <td className="py-3 px-4 text-sage-900">Total</td>
                    <td className="py-3 px-4 text-right text-sage-900">{totalItems}</td>
                    <td className="py-3 px-4 text-right text-sage-900">${totalValue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-sage-900">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
          
          <Card>
            <h3 className="font-display text-lg font-semibold text-sage-900 mb-4">
              Category Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {selectedReport === 'suppliers' && (
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="font-display text-lg font-semibold text-sage-900 mb-6">
              Supplier Analysis
            </h3>
            {supplierData.length > 0 ? (
              <>
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supplierData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e3e6dc" />
                      <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#657558" radius={[0, 4, 4, 0]} name="Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sage-100">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-sage-600">Supplier</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-sage-600">Items</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-sage-600">Total Value</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-sage-600">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100">
                      {supplierData.map(sup => (
                        <tr key={sup.name} className="hover:bg-sage-50">
                          <td className="py-3 px-4 font-medium text-sage-900">{sup.name}</td>
                          <td className="py-3 px-4 text-right text-sage-700">{sup.items}</td>
                          <td className="py-3 px-4 text-right font-medium text-sage-900">
                            ${sup.value.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-sage-600">
                            {((sup.value / totalValue) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-sage-400">
                No supplier data available
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {selectedReport === 'top-items' && (
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="font-display text-lg font-semibold text-sage-900 mb-6">
              Top 10 Items by Value
            </h3>
            {topItemsByValue.length > 0 ? (
              <>
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topItemsByValue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e3e6dc" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} height={80} />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#ee751b" radius={[4, 4, 0, 0]} name="Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sage-100">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-sage-600">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-sage-600">Item</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-sage-600">Quantity</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-sage-600">Total Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100">
                      {topItemsByValue.map((item, index) => (
                        <tr key={item.name} className="hover:bg-sage-50">
                          <td className="py-3 px-4">
                            <span className={`
                              inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                              ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                index === 1 ? 'bg-gray-200 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-sage-100 text-sage-600'}
                            `}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-sage-900">{item.name}</td>
                          <td className="py-3 px-4 text-right text-sage-700">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-sage-900">
                            ${item.value.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-sage-400">
                No items in inventory
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ReportsPage() {
  return (
    <PageWrapper>
      <ReportsContent />
    </PageWrapper>
  )
}


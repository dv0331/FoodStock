'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  Clock, 
  Package,
  ChevronRight,
  XCircle,
  Bell,
  CheckCircle
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useInventory } from '../context/InventoryContext'
import { format, differenceInDays } from 'date-fns'
import Link from 'next/link'

function AlertsContent() {
  const { 
    inventory,
    categories,
    suppliers,
    getLowStockItems, 
    getExpiringItems,
    getExpiredItems,
    getSupplierById,
    isLoaded 
  } = useInventory()

  const [activeTab, setActiveTab] = useState('all')

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

  const tabs = [
    { id: 'all', label: 'All Alerts', count: lowStockItems.length + expiringItems.length + expiredItems.length },
    { id: 'low-stock', label: 'Low Stock', count: lowStockItems.length, icon: AlertTriangle, color: 'amber' },
    { id: 'expiring', label: 'Expiring Soon', count: expiringItems.length, icon: Clock, color: 'orange' },
    { id: 'expired', label: 'Expired', count: expiredItems.length, icon: XCircle, color: 'red' },
  ]

  const getFilteredAlerts = () => {
    switch (activeTab) {
      case 'low-stock':
        return { lowStock: lowStockItems, expiring: [], expired: [] }
      case 'expiring':
        return { lowStock: [], expiring: expiringItems, expired: [] }
      case 'expired':
        return { lowStock: [], expiring: [], expired: expiredItems }
      default:
        return { lowStock: lowStockItems, expiring: expiringItems, expired: expiredItems }
    }
  }

  const alerts = getFilteredAlerts()
  const totalAlerts = lowStockItems.length + expiringItems.length + expiredItems.length

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

  const AlertCard = ({ item, type }) => {
    const category = categories.find(c => c.id === item.category)
    const supplier = getSupplierById(item.supplier)
    const daysUntilExpiry = item.expirationDate 
      ? differenceInDays(new Date(item.expirationDate), new Date())
      : null

    const getAlertStyles = () => {
      switch (type) {
        case 'low-stock':
          return {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon: AlertTriangle,
            iconColor: 'text-amber-500',
            badge: 'bg-amber-100 text-amber-700',
            label: 'Low Stock'
          }
        case 'expiring':
          return {
            bg: daysUntilExpiry <= 2 ? 'bg-red-50' : 'bg-orange-50',
            border: daysUntilExpiry <= 2 ? 'border-red-200' : 'border-orange-200',
            icon: Clock,
            iconColor: daysUntilExpiry <= 2 ? 'text-red-500' : 'text-orange-500',
            badge: daysUntilExpiry <= 2 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700',
            label: daysUntilExpiry === 0 ? 'Expires Today!' : `Expires in ${daysUntilExpiry} days`
          }
        case 'expired':
          return {
            bg: 'bg-red-50',
            border: 'border-red-300',
            icon: XCircle,
            iconColor: 'text-red-500',
            badge: 'bg-red-100 text-red-700',
            label: 'Expired'
          }
        default:
          return {}
      }
    }

    const styles = getAlertStyles()
    const IconComponent = styles.icon

    return (
      <motion.div
        variants={itemVariants}
        className={`p-4 rounded-xl ${styles.bg} border ${styles.border}`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg bg-white ${styles.iconColor}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{category?.icon || '📦'}</span>
                  <h4 className="font-semibold text-sage-900">{item.name}</h4>
                </div>
                <p className="text-sm text-sage-600">{category?.name}</p>
              </div>
              <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                {styles.label}
              </span>
            </div>
            
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-sage-500">Current Stock</p>
                <p className="font-medium text-sage-900">
                  {item.quantity} {item.unit}
                </p>
              </div>
              
              {type === 'low-stock' && (
                <div>
                  <p className="text-sage-500">Minimum Required</p>
                  <p className="font-medium text-sage-900">
                    {item.minStock} {item.unit}
                  </p>
                </div>
              )}
              
              {(type === 'expiring' || type === 'expired') && item.expirationDate && (
                <div>
                  <p className="text-sage-500">Expiration Date</p>
                  <p className="font-medium text-sage-900">
                    {format(new Date(item.expirationDate), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              
              {supplier && (
                <div>
                  <p className="text-sage-500">Supplier</p>
                  <p className="font-medium text-sage-900">{supplier.name}</p>
                </div>
              )}
            </div>

            {supplier && (
              <div className="mt-3 pt-3 border-t border-white/50">
                <p className="text-xs text-sage-500">
                  Contact: {supplier.phone} • {supplier.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
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
          <h1 className="font-display text-3xl font-bold text-sage-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-brand-500" />
            Alerts
          </h1>
          <p className="text-sage-500 mt-1">Stay on top of your inventory issues</p>
        </div>
        {totalAlerts > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{totalAlerts} alert{totalAlerts !== 1 ? 's' : ''} require attention</span>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Card padding="sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                  ${activeTab === tab.id 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' 
                    : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
                  }
                `}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
                {tab.count > 0 && (
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-xs
                    ${activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-sage-200 text-sage-700'
                    }
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* No Alerts State */}
      {totalAlerts === 0 ? (
        <motion.div variants={itemVariants}>
          <Card>
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="font-display text-xl font-semibold text-sage-900 mb-2">
                All Clear! 🎉
              </h3>
              <p className="text-sage-500 max-w-md mx-auto">
                Your inventory is in great shape. No low stock items, and nothing is expiring soon.
              </p>
              <Link href="/inventory" className="inline-block mt-6">
                <Button variant="secondary" icon={Package}>
                  View Inventory
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Low Stock Section */}
          {alerts.lowStock.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="font-display text-lg font-semibold text-sage-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Low Stock Items ({alerts.lowStock.length})
              </h2>
              <div className="space-y-3">
                {alerts.lowStock.map(item => (
                  <AlertCard key={item.id} item={item} type="low-stock" />
                ))}
              </div>
            </motion.div>
          )}

          {/* Expiring Soon Section */}
          {alerts.expiring.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="font-display text-lg font-semibold text-sage-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Expiring Soon ({alerts.expiring.length})
              </h2>
              <div className="space-y-3">
                {alerts.expiring.map(item => (
                  <AlertCard key={item.id} item={item} type="expiring" />
                ))}
              </div>
            </motion.div>
          )}

          {/* Expired Section */}
          {alerts.expired.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="font-display text-lg font-semibold text-sage-900 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Expired Items ({alerts.expired.length})
              </h2>
              <div className="space-y-3">
                {alerts.expired.map(item => (
                  <AlertCard key={item.id} item={item} type="expired" />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function AlertsPage() {
  return (
    <PageWrapper>
      <AlertsContent />
    </PageWrapper>
  )
}


'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  Settings,
  Menu,
  X,
  ChefHat
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/suppliers', label: 'Suppliers', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { getLowStockItems, getExpiringItems, isLoaded } = useInventory()

  // Calculate alert count
  const alertCount = isLoaded 
    ? getLowStockItems().length + getExpiringItems(7).length 
    : 0

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen])

  const NavLink = ({ item }) => {
    const isActive = pathname === item.href
    const Icon = item.icon
    const showBadge = item.href === '/alerts' && alertCount > 0

    return (
      <Link href={item.href}>
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl
            transition-all duration-200 group cursor-pointer
            ${isActive 
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25' 
              : 'text-sage-700 hover:bg-sage-100'
            }
          `}
        >
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-sage-500 group-hover:text-brand-500'}`} />
          <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
            {item.label}
          </span>
          {showBadge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
            >
              {alertCount}
            </motion.span>
          )}
        </motion.div>
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sage-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-sage-900">FoodStock</h1>
            <p className="text-xs text-sage-500">Inventory Manager</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sage-200">
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-sage-600 font-medium mb-2">Need Help?</p>
          <p className="text-xs text-sage-500">
            Track your inventory, reduce waste, and never run out of stock.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-sage-200">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-sage-900">FoodStock</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
          >
            {isMobileOpen ? (
              <X className="w-6 h-6 text-sage-700" />
            ) : (
              <Menu className="w-6 h-6 text-sage-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 bg-white shadow-2xl"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-sage-200 z-30">
        <SidebarContent />
      </aside>
    </>
  )
}


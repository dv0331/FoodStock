'use client'

import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import { InventoryProvider } from '../context/InventoryContext'

export default function PageWrapper({ children }) {
  return (
    <InventoryProvider>
      <div className="min-h-screen">
        <Sidebar />
        <main className="lg:ml-64 pt-20 lg:pt-0 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4 md:p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </InventoryProvider>
  )
}


'use client'

import { motion } from 'framer-motion'

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-sage-400" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-sage-800 mb-2">
        {title}
      </h3>
      <p className="text-sage-500 text-center max-w-sm mb-6">
        {description}
      </p>
      {action}
    </motion.div>
  )
}


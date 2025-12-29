'use client'

import { motion } from 'framer-motion'

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  onClick,
  gradient
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const gradientClasses = {
    brand: 'bg-gradient-to-br from-brand-500 to-brand-600',
    sage: 'bg-gradient-to-br from-sage-500 to-sage-600',
    orange: 'bg-gradient-to-br from-orange-400 to-orange-500',
    green: 'bg-gradient-to-br from-green-400 to-green-500',
    blue: 'bg-gradient-to-br from-blue-400 to-blue-500',
    purple: 'bg-gradient-to-br from-purple-400 to-purple-500',
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`
        rounded-2xl shadow-sm border border-sage-100
        ${gradient ? gradientClasses[gradient] : 'bg-white'}
        ${paddingClasses[padding]}
        ${hover ? 'cursor-pointer card-hover' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}


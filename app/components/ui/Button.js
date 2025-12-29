'use client'

import { motion } from 'framer-motion'

export default function Button({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', 
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = ''
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 
    font-medium rounded-xl transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-brand-500 to-brand-600 text-white
      hover:from-brand-600 hover:to-brand-700
      focus:ring-brand-500 shadow-lg shadow-brand-500/25
    `,
    secondary: `
      bg-sage-100 text-sage-700
      hover:bg-sage-200
      focus:ring-sage-500
    `,
    outline: `
      border-2 border-sage-300 text-sage-700
      hover:bg-sage-50 hover:border-sage-400
      focus:ring-sage-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 text-white
      hover:from-red-600 hover:to-red-700
      focus:ring-red-500 shadow-lg shadow-red-500/25
    `,
    ghost: `
      text-sage-600 hover:bg-sage-100
      focus:ring-sage-500
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600 text-white
      hover:from-green-600 hover:to-green-700
      focus:ring-green-500 shadow-lg shadow-green-500/25
    `,
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  )
}


'use client'

import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text',
  icon: Icon,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-sage-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-sage-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-sage-50 border border-sage-200
            text-sage-900 placeholder-sage-400
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:ring-red-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input


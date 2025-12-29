'use client'

import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({ 
  label, 
  error, 
  options = [],
  placeholder = 'Select an option',
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
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl appearance-none
            bg-sage-50 border border-sage-200
            text-sage-900
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-400 focus:ring-red-500' : ''}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select


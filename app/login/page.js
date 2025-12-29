'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChefHat, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, isAuthenticated, isLoading } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Validate
    if (!email.trim()) {
      setError('Please enter your email')
      setIsSubmitting(false)
      return
    }
    if (!password) {
      setError('Please enter your password')
      setIsSubmitting(false)
      return
    }

    // Attempt sign in
    const result = signIn(email, password)
    
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-sage-100">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 via-white to-brand-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sage-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sage-200/50 p-8 border border-sage-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30 mb-4"
            >
              <ChefHat className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-sage-900">Welcome to FoodStock</h1>
            <p className="text-sage-500 mt-2">Sign in to manage your inventory</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-sage-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="
                    w-full pl-12 pr-4 py-3 rounded-xl
                    bg-sage-50 border border-sage-200
                    text-sage-900 placeholder-sage-400
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-sage-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="
                    w-full pl-12 pr-12 py-3 rounded-xl
                    bg-sage-50 border border-sage-200
                    text-sage-900 placeholder-sage-400
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    transition-all duration-200
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
              icon={LogIn}
              className="py-3"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 rounded-xl bg-sage-50 border border-sage-200">
            <p className="text-sm font-medium text-sage-700 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-sm text-sage-600">
              <p><span className="font-medium">Email:</span> owner@foodstock.com</p>
              <p><span className="font-medium">Password:</span> admin123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-sage-500 mt-6">
          Restaurant & Food Truck Inventory Management
        </p>
      </motion.div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

export default function AuthWrapper({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sage-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If on login page, just render children (the login page)
  if (pathname === '/login') {
    return children
  }

  // If not authenticated, show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sage-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Authenticated, render children
  return children
}


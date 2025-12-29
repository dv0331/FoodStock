'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// Default admin user (same as InventoryContext)
const defaultUsers = [
  { 
    id: 'admin-1', 
    name: 'Business Owner', 
    email: 'owner@foodstock.com', 
    password: 'admin123',
    role: 'admin', 
    avatar: null,
    createdAt: new Date().toISOString(),
    isActive: true
  }
]

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('foodstock_auth')
    const savedUser = localStorage.getItem('foodstock_current_user')
    
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const signIn = (email, password) => {
    // Get users from localStorage, or use defaults if not found
    const savedUsers = localStorage.getItem('foodstock_users')
    let users = savedUsers ? JSON.parse(savedUsers) : defaultUsers

    // If localStorage has users but they don't have passwords (migration), merge with defaults
    if (savedUsers) {
      users = users.map(user => {
        if (!user.password) {
          const defaultUser = defaultUsers.find(d => d.email === user.email)
          return { ...user, password: defaultUser?.password || 'password123' }
        }
        return user
      })
    }

    // Find user by email (case insensitive)
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return { success: false, error: 'No account found with this email' }
    }

    if (!user.isActive) {
      return { success: false, error: 'This account has been deactivated' }
    }

    // Simple password check
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password' }
    }

    // Success - set auth state
    setIsAuthenticated(true)
    setCurrentUser(user)
    localStorage.setItem('foodstock_auth', 'true')
    localStorage.setItem('foodstock_current_user', JSON.stringify(user))
    
    // Also save users to localStorage if they weren't there (first time)
    if (!savedUsers) {
      localStorage.setItem('foodstock_users', JSON.stringify(defaultUsers))
    }
    
    return { success: true }
  }

  const signOut = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    localStorage.removeItem('foodstock_auth')
    localStorage.removeItem('foodstock_current_user')
  }

  const updateCurrentUser = (updates) => {
    const updatedUser = { ...currentUser, ...updates }
    setCurrentUser(updatedUser)
    localStorage.setItem('foodstock_current_user', JSON.stringify(updatedUser))
  }

  const value = {
    isAuthenticated,
    currentUser,
    isLoading,
    signIn,
    signOut,
    updateCurrentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

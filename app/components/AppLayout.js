'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '../context/AuthContext'
import { InventoryProvider } from '../context/InventoryContext'
import { EmployeeProvider } from '../context/EmployeeContext'
import AuthWrapper from './AuthWrapper'
import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <AuthProvider>
      <InventoryProvider>
        <EmployeeProvider>
          <AuthWrapper>
            {!isLoginPage && <Sidebar />}
            <main className={`min-h-screen bg-sage-50 ${!isLoginPage ? 'lg:pl-64 pt-16 lg:pt-0' : ''}`}>
              {children}
            </main>
          </AuthWrapper>
        </EmployeeProvider>
      </InventoryProvider>
    </AuthProvider>
  )
}


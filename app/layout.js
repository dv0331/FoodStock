import './globals.css'
import AppLayout from './components/AppLayout'

export const metadata = {
  title: 'FoodStock - Restaurant Inventory Management',
  description: 'Simple and powerful inventory management for restaurants and food trucks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍽️</text></svg>" />
      </head>
      <body className="font-body antialiased">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  )
}

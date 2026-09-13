import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import { PersistentNotificationProvider } from './context/PersistentNotificationContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PersistentNotificationProvider>
          <CartProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </CartProvider>
        </PersistentNotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

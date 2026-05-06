import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import PengaturanProvider from './components/PengaturanProvider'
import CustomCursor from './components/CustomCursor'
import { useThemeStore } from './stores/themeStore'
import './index.css'

// Apply theme immediately before render to prevent flash
const themeState = JSON.parse(localStorage.getItem('theme-storage') || '{}')
const isDarkStored = themeState?.state?.isDark ?? false
if (isDarkStored) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

// Suppress React Router removeChild errors in development
if (import.meta.env.DEV) {
  const originalError = console.error
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('removeChild') || 
       args[0].includes('NotFoundError') ||
       args[0].includes('The node to be removed is not a child'))
    ) {
      // Ignore React Router HMR errors
      return
    }
    originalError.apply(console, args)
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PengaturanProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </PengaturanProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// CustomCursor di luar StrictMode agar RAF loop tidak double-mount
// Render di semua device — touch device pakai ripple effect, mouse pakai snake cursor
const cursorRoot = document.createElement('div')
document.body.appendChild(cursorRoot)
ReactDOM.createRoot(cursorRoot).render(
  <QueryClientProvider client={queryClient}>
    <PengaturanProvider>
      <CustomCursor />
    </PengaturanProvider>
  </QueryClientProvider>
)

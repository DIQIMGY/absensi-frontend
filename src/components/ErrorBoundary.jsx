import { Component } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error tapi jangan tampilkan ke user jika error React Router
    if (error.message?.includes('removeChild')) {
      console.warn('React Router HMR error (ignored):', error)
      // Reset error state setelah 100ms
      setTimeout(() => {
        this.setState({ hasError: false, error: null })
      }, 100)
    } else {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  render() {
    // Jika error removeChild, jangan tampilkan error UI
    if (this.state.hasError && this.state.error?.message?.includes('removeChild')) {
      return this.props.children
    }

    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Terjadi Kesalahan
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {this.state.error?.message || 'Aplikasi mengalami error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} />
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

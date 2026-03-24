import React, { Component } from 'react'

/**
 * ErrorBoundary catches unhandled React render errors and displays
 * a friendly fallback instead of a blank screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
          <h2 className="text-xl font-semibold text-rose-600">Something went wrong</h2>
          <p className="text-sm text-slate-500 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.replace('/dashboard')}
              className="px-4 py-2 text-indigo-600 text-sm font-medium hover:bg-slate-100 rounded-xl transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary

'use client';

import React, { Component, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  override componentDidCatch() {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      // ErrorBoundary caught an error (development only): error, errorInfo
    }

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📰</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              An unexpected error occurred
            </h1>
            <p className="text-gray-600 mb-6">
              Sorry, something went wrong while browsing the news. Please try refreshing the page, go to the homepage, or browse another section.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <button
                onClick={this.handleRefresh}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold"
              >
                Refresh Page
              </button>
              <Link href="/" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-bold">
                Go to Homepage
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error !== null && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
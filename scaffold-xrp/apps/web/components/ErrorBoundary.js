"use client";

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's an ethereum redefinition error
    if (error && error.message && error.message.includes("Cannot redefine property: ethereum")) {
      // Log warning but don't show error UI
      console.warn(
        "[ErrorBoundary] Caught ethereum redefinition error from wallet extension. " +
        "This is harmless for XRPL wallets. The app will continue."
      );
      // Return null to indicate no error state needed
      return { hasError: false, error: null };
    }
    
    // For other errors, show error state
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Check if it's an ethereum redefinition error
    if (error && error.message && error.message.includes("Cannot redefine property: ethereum")) {
      console.warn(
        "[ErrorBoundary] Wallet extension conflict detected. " +
        "This is a known issue with EVM wallet extensions (like MetaMask) " +
        "when using XRPL wallets. The app will continue to work normally."
      );
      // Don't log to error reporting service for this specific error
      return;
    }
    
    // Log other errors normally
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    // If it's an ethereum error, just render children normally
    if (this.state.error && 
        this.state.error.message && 
        this.state.error.message.includes("Cannot redefine property: ethereum")) {
      return this.props.children;
    }

    // For other errors, show error UI
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
          <div className="max-w-md w-full text-center">
            <div className="p-8 rounded-2xl bg-white/5 border border-red-500/20">
              <div className="text-6xl mb-6">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Something went wrong
              </h2>
              <p className="text-white/60 mb-6">
                An unexpected error occurred. Please refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


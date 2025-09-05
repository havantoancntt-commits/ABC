import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-xl w-full text-center p-8 bg-gray-800 bg-opacity-50 rounded-2xl shadow-2xl border border-red-700/50 backdrop-blur-xl">
                <h1 className="text-4xl font-bold text-red-500 font-serif mb-4">Đã xảy ra lỗi</h1>
                <p className="text-lg text-gray-300 mb-6">
                    Rất tiếc, ứng dụng đã gặp sự cố không mong muốn. Vui lòng thử tải lại trang để tiếp tục.
                </p>
                <button
                    onClick={this.handleReload}
                    className="flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 bg-yellow-500 text-gray-900 hover:bg-yellow-600 py-3 px-6"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                    Tải lại trang
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

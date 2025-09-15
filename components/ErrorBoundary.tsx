import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LanguageContext, defaultLanguageContext } from '../hooks/useLocalization';
import Card from './Card';

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
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <LanguageContext.Consumer>
          {(value) => {
            const { t } = value || defaultLanguageContext;
            return (
              <div className="min-h-screen flex items-center justify-center p-4">
                  <Card className="max-w-xl w-full text-center border-red-700/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h1 className="text-4xl font-bold text-red-400 font-serif mb-4">{t('errorBoundaryTitle')}</h1>
                      <p className="text-lg text-gray-300 mb-6">
                          {t('errorBoundaryMessage')}
                      </p>
                      <button
                          onClick={this.handleReload}
                          className="flex items-center justify-center gap-2 mx-auto font-bold rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 bg-yellow-500 text-gray-900 hover:bg-yellow-600 py-3 px-6"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m9-1-9 9-9-9" /></svg>
                          {t('errorBoundaryButton')}
                      </button>
                  </Card>
              </div>
            );
          }}
        </LanguageContext.Consumer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
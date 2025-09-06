import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './hooks/useLocalization';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </LanguageProvider>
  </React.StrictMode>
);
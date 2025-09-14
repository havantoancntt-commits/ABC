import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './hooks/useLocalization';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// FIX: Corrected typo from `create_root` to `createRoot`.
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
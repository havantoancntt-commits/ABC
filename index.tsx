import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './hooks/useLocalization';
import { GoogleAuthProvider } from './hooks/useGoogleAuth';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <GoogleAuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </GoogleAuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
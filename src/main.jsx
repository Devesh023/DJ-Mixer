import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary name="DJ Mixer Pro Application">
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error("Root element #root not found in index.html");
}

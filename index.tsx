import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Global Error Handler for the "Black Screen" issue
try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
} catch (e) {
    console.error("CRITICAL RENDER ERROR:", e);
    rootElement.innerHTML = `<div style="color:red; padding:20px;">CRITICAL ERROR: ${e instanceof Error ? e.message : String(e)}</div>`;
}
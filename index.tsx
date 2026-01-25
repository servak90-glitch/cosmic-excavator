import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// [DEV_CONTEXT: MOBILE] Hide status bar on native platforms
const hideStatusBar = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.hide();
    } catch (e) {
      console.warn("StatusBar.hide failed:", e);
    }
  }
};
hideStatusBar();

// Global Error Handler for the "Black Screen" issue
try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  console.error("CRITICAL RENDER ERROR:", e);
  rootElement.innerHTML = `<div style="color:red; padding:20px;">CRITICAL ERROR: ${e instanceof Error ? e.message : String(e)}</div>`;
}
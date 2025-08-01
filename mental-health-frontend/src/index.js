import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your existing global CSS
import App from './App';
import { AuthProvider } from './contexts/authContext'; // Import AuthProvider
import { BrowserRouter } from 'react-router-dom'; // If not already using it

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Ensure BrowserRouter wraps AuthProvider if it uses navigate */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
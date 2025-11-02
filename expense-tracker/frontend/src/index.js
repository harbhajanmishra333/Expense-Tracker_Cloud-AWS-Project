import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './AppNoAuth'; // Using no-auth version for easy testing

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

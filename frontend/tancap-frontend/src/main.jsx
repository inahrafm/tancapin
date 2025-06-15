import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Pastikan path dan ekstensi file ini benar
import './index.css'; // Import CSS global Anda (yang sudah berisi Tailwind)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
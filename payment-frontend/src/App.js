// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Home */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Transactions */}
        <Route path="/dashboard/transactions" element={<TransactionsPage />} />

        {/* Checkout Page (public, order_id in URL) */}
        <Route path="/checkout/:orderId" element={<CheckoutPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

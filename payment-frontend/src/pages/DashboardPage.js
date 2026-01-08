// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate(); // for navigation
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    successRate: 0,
  });

  useEffect(() => {
    const storedKey = localStorage.getItem('apiKey');
    const storedSecret = localStorage.getItem('apiSecret');
    setApiKey(storedKey);
    setApiSecret(storedSecret);

    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/payments', {
          headers: {
            'x-api-key': storedKey,
            'x-api-secret': storedSecret,
          },
        });

        const payments = res.data;
        const totalTransactions = payments.length;
        const totalAmount = payments
          .filter(p => p.status === 'success')
          .reduce((sum, p) => sum + p.amount, 0);
        const successRate =
          totalTransactions === 0
            ? 0
            : Math.round(
                (payments.filter(p => p.status === 'success').length /
                  totalTransactions) *
                  100
              );

        setStats({ totalTransactions, totalAmount, successRate });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div data-test-id="dashboard">
      <h2>Dashboard</h2>

      <div data-test-id="api-credentials">
        <div>
          <label>API Key:</label>
          <span data-test-id="api-key">{apiKey}</span>
        </div>
        <div>
          <label>API Secret:</label>
          <span data-test-id="api-secret">{apiSecret}</span>
        </div>
      </div>

      <div data-test-id="stats-container">
        <div data-test-id="total-transactions">
          Total Transactions: {stats.totalTransactions}
        </div>
        <div data-test-id="total-amount">
          Total Amount: ₹{stats.totalAmount}
        </div>
        <div data-test-id="success-rate">
          Success Rate: {stats.successRate}%
        </div>
      </div>

      {/* ✅ Button to go to Transactions */}
      <button
        data-test-id="view-transactions-button"
        onClick={() => navigate('/dashboard/transactions')}
      >
        View Transactions
      </button>
    </div>
  );
}

export default DashboardPage;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState({ status: 'all', method: 'all' });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const apiKey = localStorage.getItem('apiKey');
        const apiSecret = localStorage.getItem('apiSecret');
        const res = await axios.get('http://localhost:8000/api/v1/payments', {
          headers: {
            'x-api-key': apiKey,
            'x-api-secret': apiSecret,
          },
        });
        setTransactions(res.data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    fetchTransactions();
  }, []);

  // Apply filters first
  const filteredTransactions = transactions.filter(tx => {
    const statusMatch = filters.status === 'all' || tx.status === filters.status;
    const methodMatch = filters.method === 'all' || tx.method === filters.method;
    return statusMatch && methodMatch;
  });

  // Apply sorting
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Transactions</h2>

      {/* Filters */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Status:
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
          </select>
        </label>

        <label style={{ marginLeft: '1rem' }}>
          Method:
          <select name="method" value={filters.method} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
        </label>
      </div>

      {/* Transactions Table */}
      <table data-test-id="transactions-table" border="1" cellPadding="5">
        <thead>
          <tr>
            <th onClick={() => requestSort('id')}>Payment ID</th>
            <th onClick={() => requestSort('order_id')}>Order ID</th>
            <th onClick={() => requestSort('amount')}>Amount</th>
            <th onClick={() => requestSort('method')}>Method</th>
            <th onClick={() => requestSort('status')}>Status</th>
            <th onClick={() => requestSort('created_at')}>Created</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map(tx => (
            <tr key={tx.id} data-test-id="transaction-row" data-payment-id={tx.id}>
              <td data-test-id="payment-id">{tx.id}</td>
              <td data-test-id="order-id">{tx.order_id}</td>
              <td data-test-id="amount">{tx.amount}</td>
              <td data-test-id="method">{tx.method}</td>
              <td data-test-id="status">{tx.status}</td>
              <td data-test-id="created-at">{new Date(tx.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsPage;

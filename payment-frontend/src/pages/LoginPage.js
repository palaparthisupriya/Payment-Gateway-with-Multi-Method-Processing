// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For Deliverable 1, just check if email matches the test merchant
    if (email === 'test@example.com') {
      // You can store API key/secret in localStorage or context
      localStorage.setItem('apiKey', 'test_api_key_123');
      localStorage.setItem('apiSecret', 'test_secret_key_123');
      navigate('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <form data-test-id="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          data-test-id="email-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          data-test-id="password-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button data-test-id="login-button" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;

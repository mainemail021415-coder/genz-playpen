import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // TAMA: /api/login endpoint na ang tinatawag dito
      const response = await fetch('https://genz-playpen-api.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Isave ang JWT token sa localStorage ng browser
        localStorage.setItem('token', data.token);
        setMessage('✅ Success! Login successful.');
        
        // Tawagin ang parent function kung naroroon ito
        if (onLoginSuccess) {
          onLoginSuccess(data.token);
        }
      } else {
        setMessage(`❌ Error: ${data.message || 'Invalid username or password'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('❌ Hindi makakonekta sa server. Paki-check ang internet o backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '350px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>🎮 GenZ Playpen - Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Submit'}
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default Login;
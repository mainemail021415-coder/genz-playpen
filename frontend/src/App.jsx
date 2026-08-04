import React, { useState, useEffect } from 'react';
import Login from './Login';

function App() {
  const [token, setToken] = useState(null);

  // Pag-open ng page, i-check kung may umiiral nang token sa localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #4CAF50', borderRadius: '8px' }}>
          <h1>🎉 Welcome sa GenZ Playpen!</h1>
          <p>Naka-login ka na nang matagumpay gamit ang JWT Authentication.</p>
          <button
            onClick={handleLogout}
            style={{ padding: '10px 20px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px' }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
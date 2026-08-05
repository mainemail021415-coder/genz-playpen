import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/Login';
import HomeFeed from './pages/HomeFeed';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function para i-decode ang token at makuha ang username
  const processToken = (jwtToken) => {
    try {
      const decoded = jwtDecode(jwtToken);
      setToken(jwtToken);
      setUser(decoded); // Naglalaman ng { userId, username }
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      processToken(savedToken);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (newToken) => {
    processToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
        <h2>Loading GenZ Playpen...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <HomeFeed user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
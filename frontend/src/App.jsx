import React, { useState, useEffect } from 'react';
import Login from './pages/Login'; // Kinuha mula sa src/pages/Login.jsx
import HomeFeed from './pages/HomeFeed'; // Kinuha mula sa src/pages/HomeFeed.jsx (o baguhin ang path kung iba)

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pag-open pa lang ng website, i-check kung may token na sa browser (localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // Tawagin ito kapag matagumpay ang pag-login sa Login.jsx
  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  // Tawagin ito kapag pinindot ang Logout button
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
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
        // Kung WALANG token, ipakita ang Login page
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Kung MAY token, rekta na sa HomeFeed page
        <HomeFeed onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import Login from './Login';
import HomeFeed from './HomeFeed'; // Siguraduhing may HomeFeed component ka o i-import ito

function App() {
  const [token, setToken] = useState(null);

  // Pag-load ng page, i-check kung may nakatagong token
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken); // Kapag na-set ang token, kusa nang mag-iiba ang screen papuntang HomeFeed!
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="app-container">
      {!token ? (
        // Kung WALANG TOKEN, Login form ang makikita
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Kung MAY TOKEN, rekta na sa HomeFeed
        <HomeFeed token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
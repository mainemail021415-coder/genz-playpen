import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import HomeFeed from './pages/HomeFeed';
import Profile from './pages/Profile';
import Auth from './pages/Auth'; // Siguraduhing may Auth/Login component ka

function App() {
  // Kunin ang kasalukuyang logged-in user mula sa LocalStorage (kung mayroon na)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('genz_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Handler para sa Login
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('genz_user', JSON.stringify(userData));
  };

  // Handler para sa Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('genz_user');
    localStorage.removeItem('genz_token');
  };

  return (
    <Router>
      <Routes>
        {/* ROUTE 1: AUTHENTICATION (LOGIN / REGISTER) */}
        <Route
          path="/login"
          element={
            !currentUser ? (
              <Auth onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ROUTE 2: HOME FEED (MAIN PAGE) */}
        <Route
          path="/"
          element={
            currentUser ? (
              <HomeFeed user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ROUTE 3: PUBLIC USER PROFILE PAGE */}
        <Route
          path="/profile/:username"
          element={
            currentUser ? (
              <Profile currentUser={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* CATCH-ALL ROUTE (REDIRECT SA HOME KAPAG MALI ANG URL) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
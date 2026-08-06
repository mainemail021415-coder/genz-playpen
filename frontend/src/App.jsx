import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Suriin ang localStorage para sa Token o Saved User Session
  useEffect(() => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing saved user from localStorage:", err);
        localStorage.removeItem('user');
      }
    } else if (token) {
      // Kung may token ngunit walang saved user object, i-decode ang payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          _id: payload.id || payload.userId || payload._id,
          username: payload.username || payload.name || 'User'
        });
      } catch (err) {
        console.error("Invalid token format:", err);
        localStorage.removeItem('userToken');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
        <h2>Loading GenZiPlaypen...</h2>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        
        {/* Navigation Bar / Header - I-re-render lamang kapag may authenticated user */}
        {user && <Navbar user={user} handleLogout={handleLogout} />}

        {/* Navigation Routes */}
        <main style={{ padding: '20px 10px' }}>
          <Routes>
            {/* Auth Route */}
            <Route 
              path="/auth" 
              element={!user ? <Auth /> : <Navigate to="/" replace />} 
            />
            
            {/* Main Feed Route */}
            <Route 
              path="/" 
              element={user ? <Feed /> : <Navigate to="/auth" replace />} 
            />

            {/* Profile Route */}
            <Route 
              path="/profile/:id" 
              element={user ? <Profile currentUser={user} /> : <Navigate to="/auth" replace />} 
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to={user ? "/" : "/auth"} replace />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;
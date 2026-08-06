import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import SearchUsers from './SearchUsers';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

function Navbar({ user, handleLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    // 1. Kumonekta sa Socket.io server
    const socket = io(API_URL);

    // 2. Sumali sa sariling room para sa private notifications
    socket.emit('join_user_room', user._id);

    // 3. Makinig sa pakikipag-ugnayan mula sa ibang users (like/comment)
    socket.on('receive_notification', (data) => {
      // data format: { senderName, type: 'like' | 'comment', postId, createdAt }
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // I-toggle ang dropdown at i-reset ang unread counter
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setUnreadCount(0); // I-clear ang counter kapag binuksan
    }
  };

  return (
    <nav style={{
      padding: '12px 24px',
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      color: '#ffffff',
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      {/* Brand & Main Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7' }}>🎮 GenZiPlaypen</span>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Feed</Link>
        <Link to={`/profile/${user._id || user.username}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Profile</Link>
      </div>

      {/* Search Component */}
      <SearchUsers />

      {/* User Actions & Notification Bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
        
        {/* --- NOTIFICATION BELL ICON --- */}
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={toggleDropdown}>
          <span style={{ fontSize: '1.3rem' }}>🔔</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-8px',
              backgroundColor: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              {unreadCount}
            </span>
          )}

          {/* --- NOTIFICATIONS DROPDOWN MENU --- */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '35px',
              width: '280px',
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              padding: '10px',
              maxHeight: '350px',
              overflowY: 'auto',
              zIndex: 1001
            }}>
              <h4 style={{ margin: '5px 10px 10px 10px', fontSize: '0.9rem', color: '#a855f7' }}>
                Notifications
              </h4>
              <hr style={{ border: '0.5px solid rgba(255,255,255,0.1)', marginBottom: '8px' }} />

              {notifications.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '10px 0' }}>
                  Walang bagong notification.
                </p>
              ) : (
                notifications.map((notif, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      marginBottom: '6px',
                      fontSize: '0.82rem',
                      lineHeight: '1.4'
                    }}
                  >
                    <strong>@{notif.senderName || 'Isang user'}</strong>{' '}
                    {notif.type === 'like' && 'ang nag-like sa post mo. ❤️'}
                    {notif.type === 'comment' && 'ang nag-comment sa post mo. 💬'}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <span style={{ fontSize: '0.9rem' }}>Hi, <strong style={{ color: '#a855f7' }}>{user.username}</strong>!</span>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
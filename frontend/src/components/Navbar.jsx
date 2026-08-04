import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Kunin ang User ID mula sa JWT Token
  const getCurrentUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId || payload._id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // Load Initial Unread Notifications Count
  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const unread = Array.isArray(data) ? data.filter((n) => !n.read).length : 0;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Fetch notification count error:', err);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    // Load initial count
    fetchUnreadCount();

    // Sumali sa sariling personal notification room sa Socket.io
    socket.emit('join_user_room', currentUserId);

    // Manggaling sa backend kapag may nag-like, nag-comment, o nag-follow
    const handleReceiveNotif = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('receive_notification', handleReceiveNotif);

    return () => {
      socket.off('receive_notification', handleReceiveNotif);
    };
  }, [currentUserId]);

  // Kapag pumasok ang user sa Notifications page, i-clear ang badge
  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) return null; // Huwag ipakita ang Navbar kapag hindi pa logged in

  return (
    <nav
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '12px 20px'
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* App Logo / Brand */}
        <Link
          to="/"
          style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}
        >
          SocialApp ✨
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Feed Link */}
          <Link
            to="/"
            style={{
              color: location.pathname === '/' ? '#a855f7' : '#94a3b8',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            🏠 Home
          </Link>

          {/* Notifications Bell Link with Badge */}
          <Link
            to="/notifications"
            style={{
              color: location.pathname === '/notifications' ? '#a855f7' : '#94a3b8',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            🔔 Notifs
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-12px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  lineHeight: 1
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Chat Link */}
          <Link
            to="/chat"
            style={{
              color: location.pathname === '/chat' ? '#a855f7' : '#94a3b8',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            💬 Chat
          </Link>

          {/* Profile Link */}
          <Link
            to={`/profile/${currentUserId}`}
            style={{
              color: location.pathname.startsWith('/profile') ? '#a855f7' : '#94a3b8',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            👤 Profile
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.82rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
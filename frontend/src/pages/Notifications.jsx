import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data || []);
        }
      } catch (err) {
        console.error('Fetch notifications error:', err);
      }
    };

    fetchNotifications();

    if (currentUserId) {
      socket.emit('join', currentUserId);

      socket.on('get_notification', (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });
    }

    return () => {
      socket.off('get_notification');
    };
  }, [currentUserId, token]);

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '0 15px', color: '#f8fafc' }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#a855f7' }}>
        🔔 Mga Notification
      </h2>

      {notifications.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>Wala ka pang mga notification.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif) => (
            <div
              key={notif._id}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 18px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <img
                src={notif.sender?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                alt="Avatar"
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 'bold', color: '#a855f7' }}>
                  {notif.sender?.name || 'Isang user'}{' '}
                </span>
                <span>
                  {notif.type === 'like' && 'ang nag-like sa iyong post. ❤️'}
                  {notif.type === 'comment' && 'ang nag-comment sa iyong post. 💬'}
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
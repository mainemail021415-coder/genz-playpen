import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ChatList() {
  const [followingUsers, setFollowingUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Helper para makuha ang ID ng kasalukuyang user
  const getCurrentUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (!token) return;

    // Fetch lahat ng users para sa Following Bar at Recent Chats list
    fetch('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((users) => {
        if (Array.isArray(users)) {
          // Kunin ang mga tao kung kanino nakasubscribe / na-follow ng user
          // At i-filter ang sarili para hindi lumabas sa listahan
          const otherUsers = users.filter((u) => u._id !== currentUserId);
          
          setFollowingUsers(otherUsers);
          setRecentChats(otherUsers); // Sa ngayon, ipapakita rin ang available chats
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching chat users:', err);
        setLoading(false);
      });
  }, [token, currentUserId]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        padding: '25px 15px'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💬 Direct Messages
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>Loading chats...</p>
        ) : (
          <>
            {/* 1. TOP HORIZONTAL ROW: FOLLOWED / ACTIVE USERS (Instagram Story Style) */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', pb: '15px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Following
              </span>

              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  overflowX: 'auto',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  scrollbarWidth: 'none' // Para sa malinis na scrollbar
                }}
              >
                {followingUsers.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No users followed yet.</p>
                ) : (
                  followingUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => navigate(`/chat/${user._id}`)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        minWidth: '65px'
                      }}
                    >
                      {/* Avatar with Gradient Ring */}
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          padding: '3px',
                          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            backgroundColor: '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: '#fff'
                          }}
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Name below avatar */}
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: '#cbd5e1',
                          fontWeight: '600',
                          textAlign: 'center',
                          maxWidth: '65px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {user.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. BOTTOM VERTICAL LIST: RECENT MESSAGES / CONVERSATIONS */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Recent Messages
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {recentChats.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>No recent messages.</p>
                ) : (
                  recentChats.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => navigate(`/chat/${user._id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          color: '#fff',
                          flexShrink: 0
                        }}
                      >
                        {user.name?.charAt(0).toUpperCase()}
                      </div>

                      {/* Conversation Preview */}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#fff' }}>{user.name}</h4>
                        <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                          Tap to view recent and future messages ✨
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatList;
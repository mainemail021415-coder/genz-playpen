import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';

// I-connect ang Socket.io sa backend URL
const socket = io('http://localhost:5000');

function Chat() {
  const [searchParams] = useSearchParams();
  const targetUserIdFromUrl = searchParams.get('user');

  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Kunin ang kasalukuyang User ID mula sa Token
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

  // 1. I-fetch ang listahan ng mga users para sa contacts sidebar
  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then((res) => res.json())
      .then((data) => {
        const users = Array.isArray(data) ? data : data.users || [];
        // Alisin ang sarili sa listahan ng kakausapin
        const filteredUsers = users.filter((u) => String(u._id) !== String(currentUserId));
        setUserList(filteredUsers);

        // Kung may 'user' parameter sa URL (hal. galing sa Profile -> Message button)
        if (targetUserIdFromUrl) {
          const selected = filteredUsers.find((u) => String(u._id) === String(targetUserIdFromUrl));
          if (selected) setActiveChatUser(selected);
        } else if (filteredUsers.length > 0) {
          // Piliin ang unang user bilang default
          setActiveChatUser(filteredUsers[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch users error:', err);
        setLoading(false);
      });
  }, [currentUserId, targetUserIdFromUrl]);

  // 2. Room Setup at Socket Event Listeners
  useEffect(() => {
    if (!activeChatUser || !currentUserId) return;

    // Gumawa ng natatanging Room ID sa pagitan ng dalawang users
    const roomId = [currentUserId, activeChatUser._id].sort().join('_');

    // Sumali sa Socket Room
    socket.emit('join_room', roomId);

    // Kumuha ng dating chat history mula sa API (kung mayroon)
    fetch(`http://localhost:5000/api/chat/history/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));

    // Mag-listen sa pumasok na bagong mensahe
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('receive_message', handleReceiveMessage);

    // Clean up listener kapag nagpalit ng active chat
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [activeChatUser, currentUserId, token]);

  // Awtomatikong mag-scroll pababa sa pinakabagong mensahe
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Magpadala ng Mensahe
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;

    const roomId = [currentUserId, activeChatUser._id].sort().join('_');

    const messageData = {
      room: roomId,
      sender: currentUserId,
      receiver: activeChatUser._id,
      text: newMessage,
      createdAt: new Date().toISOString()
    };

    // Ipadala via Socket.io para sa real-time update
    socket.emit('send_message', messageData);

    // I-save din sa Database via HTTP request (Optional pero iminumungkahi)
    try {
      await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
    } catch (err) {
      console.error('Save message error:', err);
    }

    setNewMessage('');
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Loading Messages...</div>;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', backgroundColor: '#090d16', color: '#f8fafc', padding: '20px' }}>
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          height: '80vh',
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}
      >
        {/* SIDEBAR: Users / Contacts List */}
        <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 'bold' }}>
            💬 Messages
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {userList.length === 0 ? (
              <p style={{ padding: '15px', color: '#64748b', fontSize: '0.85rem' }}>No other users found.</p>
            ) : (
              userList.map((u) => {
                const isActive = activeChatUser?._id === u._id;
                return (
                  <div
                    key={u._id}
                    onClick={() => setActiveChatUser(u)}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                      borderLeft: isActive ? '4px solid #a855f7' : '4px solid transparent',
                      transition: '0.2s'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        {activeChatUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Active User Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#fff'
                }}
              >
                {activeChatUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{activeChatUser.name}</h4>
                <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>● Online</span>
              </div>
            </div>

            {/* Messages Box */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                  Say hi to {activeChatUser.name}! 👋
                </div>
              ) : (
                messages.map((m, index) => {
                  const isMyMessage = String(m.sender) === String(currentUserId);
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: isMyMessage ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '10px 16px',
                          borderRadius: isMyMessage ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          background: isMyMessage
                            ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                            : 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          fontSize: '0.92rem',
                          lineHeight: '1.4',
                          wordBreak: 'break-word'
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder={`Message ${activeChatUser.name}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
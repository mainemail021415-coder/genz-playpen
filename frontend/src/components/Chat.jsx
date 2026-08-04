import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const Chat = ({ currentUserId, targetUserId, targetUserName = "Ka-chat", onUnreadChange }) => {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  // 1. FETCH CHAT HISTORY MULA SA MONGODB VIA REST API
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!currentUserId || !targetUserId) return;
      setLoadingHistory(true);
      try {
        const response = await fetch(`${SOCKET_SERVER_URL}/api/messages/${currentUserId}/${targetUserId}`);
        const data = await response.json();
        setChatLog(data);
      } catch (error) {
        console.error('Error fetching chat history from MongoDB:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [currentUserId, targetUserId]);

  // 2. SOCKET.IO LISTENERS SETUP
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    if (currentUserId) {
      socketRef.current.emit('register_user', String(currentUserId));
    }

    // Mark messages as read sa server
    socketRef.current.emit('mark_as_read', {
      userId: currentUserId,
      targetId: targetUserId
    });

    // Makinig sa online status updates
    socketRef.current.on('get_online_users', (onlineUserIds) => {
      setIsOnline(onlineUserIds.includes(String(targetUserId)));
    });

    // Tanggapin ang pumasok na bagong message
    socketRef.current.on('receive_direct_message', (newMessage) => {
      if (String(newMessage.senderId) === String(targetUserId)) {
        setChatLog((prev) => [...prev, newMessage]);
        socketRef.current.emit('mark_as_read', {
          userId: currentUserId,
          targetId: targetUserId
        });
      }
    });

    // Update unread count callback sa App.jsx
    socketRef.current.on('update_unread_count', ({ senderId, count }) => {
      if (onUnreadChange) {
        onUnreadChange(senderId, count);
      }
    });

    // Kumpirmasyon mula sa server kapag na-save at naipadala na ang pinalabas na message
    socketRef.current.on('message_sent_confirm', (sentMessage) => {
      setChatLog((prev) => [...prev, sentMessage]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUserId, targetUserId]);

  // Auto-scroll sa pinakababang message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Submitting Form / Sending Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const payload = {
      senderId: String(currentUserId),
      receiverId: String(targetUserId),
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activeChatTargetId: String(targetUserId)
    };

    socketRef.current.emit('send_direct_message', payload);
    setMessage('');
  };

  return (
    <div style={styles.container}>
      {/* Header Bar */}
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>{targetUserName}</h3>
        <span style={{ ...styles.statusBadge, backgroundColor: isOnline ? '#4CAF50' : '#9E9E9E' }}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Messages Display Box */}
      <div style={styles.chatArea}>
        {loadingHistory ? (
          <p style={styles.emptyText}>Kinalalaplap ang lumang history...</p>
        ) : chatLog.length === 0 ? (
          <p style={styles.emptyText}>Simulan ang inyong usapan kay {targetUserName}!</p>
        ) : (
          chatLog.map((item, index) => {
            const isMe = String(item.senderId) === String(currentUserId);
            return (
              <div
                key={item._id || index}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: isMe ? '#0084FF' : '#E4E6EB',
                    color: isMe ? '#FFFFFF' : '#000000',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                  }}
                >
                  <p style={styles.messageText}>{item.message}</p>
                  <span style={{ ...styles.timestamp, color: isMe ? '#E0E0E0' : '#65676B' }}>
                    {item.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Text Input & Send Button */}
      <form onSubmit={handleSendMessage} style={styles.inputForm}>
        <input
          type="text"
          placeholder="Mag-type ng mensahe..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.inputField}
        />
        <button type="submit" style={styles.sendButton}>Send</button>
      </form>
    </div>
  );
};

// UI Styles
const styles = {
  container: { width: '100%', maxWidth: '450px', height: '520px', margin: '0 auto', border: '1px solid #E0E0E0', borderRadius: '12px', display: 'flex', flexDirection: 'column', backgroundColor: '#FFF', fontFamily: 'sans-serif' },
  header: { padding: '12px 16px', borderBottom: '1px solid #E0E0E0', backgroundColor: '#F8F9FA', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '16px', color: '#333' },
  statusBadge: { padding: '3px 10px', borderRadius: '12px', color: '#FFF', fontSize: '11px', fontWeight: 'bold' },
  chatArea: { flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: '10px' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 'auto', marginBottom: 'auto', fontSize: '14px' },
  messageWrapper: { display: 'flex', width: '100%' },
  messageBubble: { maxWidth: '75%', padding: '8px 12px', wordBreak: 'break-word' },
  messageText: { margin: 0, fontSize: '14px' },
  timestamp: { fontSize: '9px', display: 'block', marginTop: '4px', textAlign: 'right' },
  inputForm: { display: 'flex', padding: '10px', borderTop: '1px solid #E0E0E0' },
  inputField: { flex: 1, padding: '8px 12px', border: '1px solid #CCC', borderRadius: '20px', outline: 'none', fontSize: '14px' },
  sendButton: { marginLeft: '8px', padding: '8px 16px', backgroundColor: '#0084FF', color: '#FFF', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Chat;
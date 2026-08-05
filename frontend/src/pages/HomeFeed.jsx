import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_BASE = 'https://genz-playpen-api.onrender.com';
const socket = io(API_BASE);

function HomeFeed({ user, onLogout }) {
  const currentUsername = user?.username || 'Anonymous GenZ';

  // --- POSTS STATES ---
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  // --- NAVBAR MODALS STATES ---
  const [showChatsModal, setShowChatsModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // --- REAL-TIME CHAT STATES ---
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatBottomRef = useRef(null);

  // --- NOTIFICATIONS STATE ---
  const [notifications, setNotifications] = useState([]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // --- DYNAMIC TIME AGO FORMATTER (WALANG APEKTO SA KASALUKUYANG ORAS) ---
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 10) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // --- FETCH NOTIFICATIONS FROM BACKEND ---
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/${currentUsername}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // --- FETCH POSTS ---
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchNotifications();

    // Socket.io Listener para sa Real-Time Messages
    socket.on('receive_message', (data) => {
      setChatMessages((prev) => [...prev, data]);
    });

    // 🔔 REAL-TIME SOCKET LISTENER PARA SA NOTIFICATIONS NG USER THIS SECOND
    socket.on(`notification_${currentUsername}`, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      socket.off('receive_message');
      socket.off(`notification_${currentUsername}`);
    };
  }, [currentUsername]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() && !selectedImage) return;

    setIsPosting(true);

    const formData = new FormData();
    formData.append('author', currentUsername);
    formData.append('content', newPostText);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      const response = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const savedPost = await response.json();
        setPosts([savedPost, ...posts]);
        setNewPostText('');
        removeSelectedImage();
      } else {
        alert('❌ Error uploading post.');
      }
    } catch (error) {
      console.error('Post Error:', error);
      alert('❌ Upload failed.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map((p) => (p._id === postId ? updatedPost : p)));
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentInput.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentUsername, text: commentInput }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map((p) => (p._id === postId ? updatedPost : p)));
        setCommentInput('');
      }
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Sigurado ka bang gusto mo itong burahin?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername }),
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p._id !== postId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const messageData = {
      author: currentUsername,
      text: currentMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send_message', messageData);
    setCurrentMessage('');
  };

  const toggleChatsModal = () => {
    setShowChatsModal(!showChatsModal);
    setShowNotifModal(false);
    setShowProfileModal(false);
  };

  // MARK NOTIFICATIONS AS READ WHEN OPENED
  const toggleNotifModal = async () => {
    setShowNotifModal(!showNotifModal);
    setShowChatsModal(false);
    setShowProfileModal(false);

    if (!showNotifModal && unreadNotifCount > 0) {
      try {
        await fetch(`${API_BASE}/api/notifications/read/${currentUsername}`, {
          method: 'PUT',
        });
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
      } catch (error) {
        console.error('Error marking notifications read:', error);
      }
    }
  };

  const toggleProfileModal = () => {
    setShowProfileModal(!showProfileModal);
    setShowChatsModal(false);
    setShowNotifModal(false);
  };

  return (
    <div style={styles.appWrapper}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>🎮 GenZ Playpen</div>

          {/* ACTIONS */}
          <div style={styles.navActions}>
            {/* CHATS BUTTON */}
            <div style={{ position: 'relative' }}>
              <button onClick={toggleChatsModal} style={styles.iconBtn} title="Messages">
                💬
              </button>
            </div>

            {/* NOTIFICATIONS BUTTON */}
            <div style={{ position: 'relative' }}>
              <button onClick={toggleNotifModal} style={styles.iconBtn} title="Notifications">
                🔔
                {unreadNotifCount > 0 && <span style={styles.badge}>{unreadNotifCount}</span>}
              </button>

              {/* NOTIFICATIONS DROPDOWN MODAL */}
              {showNotifModal && (
                <div style={styles.dropdownModal}>
                  <h3 style={styles.modalTitle}>🔔 Notifications</h3>
                  <hr style={styles.divider} />

                  {notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', margin: '15px 0' }}>
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        style={{
                          ...styles.notifItem,
                          backgroundColor: notif.read ? '#fff' : '#f0f7ff',
                        }}
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${notif.sender}`}
                          alt="Avatar"
                          style={styles.modalAvatar}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '13px' }}>
                            <b>@{notif.sender}</b> {notif.message}
                          </p>
                          <span style={styles.timeText}>{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* PROFILE BUTTON */}
            <div style={{ position: 'relative' }}>
              <button onClick={toggleProfileModal} style={styles.profileBtn}>
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`}
                  alt="Avatar"
                  style={styles.navAvatar}
                />
                <span style={styles.profileName}>@{currentUsername}</span>
              </button>

              {/* PROFILE DROPDOWN */}
              {showProfileModal && (
                <div style={styles.dropdownModal}>
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`}
                      alt="Avatar"
                      style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                    />
                    <h3 style={{ margin: '8px 0 2px 0' }}>@{currentUsername}</h3>
                    <span style={{ fontSize: '12px', color: '#666' }}>GenZ Member</span>
                  </div>
                  <hr style={styles.divider} />
                  <button onClick={onLogout} style={styles.fullLogoutBtn}>
                    🚪 Logout Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* REAL-TIME SOCKET CHAT FLOATING WINDOW */}
      {showChatsModal && (
        <div style={styles.chatBoxModal}>
          <div style={styles.chatHeader}>
            <h4 style={{ margin: 0 }}>💬 Live GenZ Chat</h4>
            <button onClick={() => setShowChatsModal(false)} style={styles.closeChatBtn}>
              ✖
            </button>
          </div>

          <div style={styles.messageBody}>
            {chatMessages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', marginTop: '20px', fontSize: '12px' }}>
                No messages yet. Say hi! 👋
              </p>
            ) : (
              chatMessages.map((msg, index) => {
                const isMe = msg.author === currentUsername;
                return (
                  <div
                    key={index}
                    style={{
                      ...styles.messageBubble,
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      backgroundColor: isMe ? '#0070f3' : '#e4e6eb',
                      color: isMe ? '#fff' : '#000',
                    }}
                  >
                    <span style={styles.msgAuthor}>@{msg.author}</span>
                    <p style={{ margin: '2px 0' }}>{msg.text}</p>
                    <span style={styles.msgTime}>{msg.time}</span>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          <form onSubmit={handleSendMessage} style={styles.chatInputContainer}>
            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              style={styles.chatInput}
            />
            <button type="submit" style={styles.sendBtn}>
              Send
            </button>
          </form>
        </div>
      )}

      {/* MAIN CONTENT LAYOUT */}
      <div style={styles.mainLayout}>
        <div style={styles.feedContainer}>
          {/* CREATE POST CARD */}
          <div style={styles.card}>
            <form onSubmit={handleCreatePost}>
              <div style={styles.createPostHeader}>
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`}
                  alt="Avatar"
                  style={styles.avatar}
                />
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder={`What's on your mind, @${currentUsername}?`}
                  rows="3"
                  style={styles.postInput}
                />
              </div>

              {imagePreview && (
                <div style={{ position: 'relative', marginTop: '10px' }}>
                  <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                  <button type="button" onClick={removeSelectedImage} style={styles.removeImageBtn}>
                    ✖
                  </button>
                </div>
              )}

              <div style={styles.createPostActions}>
                <label style={styles.uploadLabel}>
                  📸 Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>

                <button type="submit" disabled={isPosting} style={styles.postBtn}>
                  {isPosting ? 'Uploading...' : 'Post'}
                </button>
              </div>
            </form>
          </div>

          {/* POSTS FEED */}
          {loading ? (
            <p style={{ textAlign: 'center' }}>⏳ Loading feed...</p>
          ) : (
            posts.map((post) => {
              const isLiked = post.likes?.includes(currentUsername);
              const isAuthor = post.author === currentUsername;

              return (
                <div key={post._id} style={styles.card}>
                  <div style={styles.postHeader}>
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${post.author}`}
                      alt="Avatar"
                      style={styles.avatar}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={styles.authorName}>@{post.author}</h4>
                      <span style={styles.postTime}>{formatTimeAgo(post.createdAt)}</span>
                    </div>

                    {isAuthor && (
                      <button onClick={() => handleDeletePost(post._id)} style={styles.deleteBtn}>
                        🗑️
                      </button>
                    )}
                  </div>

                  {post.content && <p style={styles.postContent}>{post.content}</p>}

                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post Attachment" style={styles.postImage} />
                  )}

                  <div style={styles.postFooter}>
                    <button
                      onClick={() => handleLike(post._id)}
                      style={{ ...styles.actionBtn, color: isLiked ? '#e74c3c' : '#65676b' }}
                    >
                      {isLiked ? '❤️' : '🤍'} {post.likes?.length || 0} Likes
                    </button>
                    <button
                      onClick={() =>
                        setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)
                      }
                      style={styles.actionBtn}
                    >
                      💬 {post.comments?.length || 0} Comments
                    </button>
                  </div>

                  {/* COMMENTS SECTION */}
                  {activeCommentPostId === post._id && (
                    <div style={styles.commentSection}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          style={styles.commentInput}
                        />
                        <button onClick={() => handleAddComment(post._id)} style={styles.sendCommentBtn}>
                          Send
                        </button>
                      </div>

                      {post.comments?.map((c, i) => (
                        <div key={i} style={styles.commentBox}>
                          <b>@{c.author}: </b> {c.text}
                          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                            {formatTimeAgo(c.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center' }}>
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`}
                alt="Profile"
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              />
              <h3 style={{ margin: '10px 0 0 0' }}>@{currentUsername}</h3>
              <p style={{ fontSize: '12px', color: '#777', margin: '4px 0 0 0' }}>Logged In User</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES OBJECT
const styles = {
  appWrapper: { backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' },
  navbar: { backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '10px 0', position: 'sticky', top: 0, zIndex: 100 },
  navContainer: { maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center' },
  logo: { fontSize: '20px', fontWeight: 'bold', color: '#0070f3' },
  navActions: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconBtn: { backgroundColor: '#e4e6eb', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#e74c3c', color: '#fff', fontSize: '11px', fontWeight: 'bold', borderRadius: '10px', padding: '2px 6px' },
  profileBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: '#e4e6eb', padding: '4px 12px 4px 4px', borderRadius: '20px', cursor: 'pointer' },
  profileName: { fontWeight: 'bold', fontSize: '14px' },
  navAvatar: { width: '32px', height: '32px', borderRadius: '50%' },
  dropdownModal: { position: 'absolute', top: '50px', right: '0', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '10px', width: '300px', maxHeight: '400px', overflowY: 'auto', padding: '12px', zIndex: 1000 },
  modalTitle: { margin: '0 0 8px 0', fontSize: '16px' },
  divider: { border: 'none', borderTop: '1px solid #eee', margin: '8px 0' },
  modalAvatar: { width: '36px', height: '36px', borderRadius: '50%' },
  notifItem: { display: 'flex', gap: '10px', padding: '8px', borderRadius: '6px', marginBottom: '4px', alignItems: 'center' },
  timeText: { fontSize: '11px', color: '#888' },
  fullLogoutBtn: { width: '100%', backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' },

  // CHAT BOX FLOATING MODAL
  chatBoxModal: { position: 'fixed', bottom: '20px', right: '20px', width: '320px', height: '420px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', zIndex: 1000 },
  chatHeader: { padding: '12px 15px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeChatBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' },
  messageBody: { flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  messageBubble: { maxWidth: '75%', padding: '8px 12px', borderRadius: '12px', fontSize: '13px' },
  msgAuthor: { fontSize: '10px', fontWeight: 'bold', opacity: 0.8 },
  msgTime: { fontSize: '9px', opacity: 0.7, float: 'right', marginTop: '2px' },
  chatInputContainer: { display: 'flex', padding: '8px', borderTop: '1px solid #eee' },
  chatInput: { flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none' },
  sendBtn: { backgroundColor: '#0070f3', color: '#fff', border: 'none', padding: '8px 12px', marginLeft: '5px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },

  // MAIN FEED LAYOUT
  mainLayout: { maxWidth: '1000px', margin: '20px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' },
  feedContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  createPostHeader: { display: 'flex', gap: '10px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%' },
  postInput: { width: '100%', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', outline: 'none', resize: 'none' },
  createPostActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' },
  uploadLabel: { cursor: 'pointer', padding: '8px 14px', backgroundColor: '#e4e6eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', color: '#050505' },
  previewImage: { width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px' },
  removeImageBtn: { position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer' },
  postBtn: { backgroundColor: '#0070f3', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
  postHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  authorName: { margin: 0 },
  postTime: { fontSize: '12px', color: '#777' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  postContent: { fontSize: '15px', marginBottom: '12px' },
  postImage: { width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' },
  postFooter: { display: 'flex', borderTop: '1px solid #eee', paddingTop: '10px', gap: '10px' },
  actionBtn: { flex: 1, padding: '6px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#555' },
  commentSection: { marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' },
  commentInput: { flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px' },
  sendCommentBtn: { backgroundColor: '#0070f3', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' },
  commentBox: { backgroundColor: '#f0f2f5', padding: '8px 12px', borderRadius: '6px', marginTop: '6px', fontSize: '13px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' },
};

export default HomeFeed;
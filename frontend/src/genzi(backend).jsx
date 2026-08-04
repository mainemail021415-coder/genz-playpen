import React, { useState } from 'react';
import Chat from './components/Chat.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' o 'chat'

  // Sample Users
  const users = [
    { id: '1', name: 'Juan Dela Cruz' },
    { id: '2', name: 'Maria Santos' },
    { id: '3', name: 'Pedro Penduko' }
  ];

  const [currentUserId, setCurrentUserId] = useState('1');
  const [targetUserId, setTargetUserId] = useState('2');
  const [unreadMap, setUnreadMap] = useState({});

  // Sample Posts para sa Home Feed
  const [posts, setPosts] = useState([
    { id: 1, author: 'Maria Santos', content: 'Magandang araw sa lahat! Masayang matuto ng Web Development! 🚀', likes: 5 },
    { id: 2, author: 'Pedro Penduko', content: 'Sino ang available mag-coffee ngayon? ☕', likes: 2 }
  ]);
  const [newPostText, setNewPostText] = useState('');

  const targetUserObj = users.find((user) => user.id === targetUserId);
  const targetUserName = targetUserObj ? targetUserObj.name : 'User';

  const handleUnreadChange = (senderId, count) => {
    setUnreadMap((prev) => ({
      ...prev,
      [senderId]: count
    }));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const currentUserObj = users.find((u) => u.id === currentUserId);
    const newPost = {
      id: Date.now(),
      author: currentUserObj ? currentUserObj.name : 'Anonymous',
      content: newPostText,
      likes: 0
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const totalUnread = Object.values(unreadMap).reduce((acc, curr) => acc + curr, 0);

  return (
    <div style={styles.appContainer}>
      {/* Navigation Header */}
      <header style={styles.navHeader}>
        <h2 style={styles.logo}>📱 MySocialApp</h2>
        
        <nav style={styles.navButtons}>
          <button
            onClick={() => setActiveTab('feed')}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === 'feed' ? '#0084FF' : '#E4E6EB',
              color: activeTab === 'feed' ? '#FFF' : '#333'
            }}
          >
            🏠 Home Feed
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === 'chat' ? '#0084FF' : '#E4E6EB',
              color: activeTab === 'chat' ? '#FFF' : '#333'
            }}
          >
            💬 Messages {totalUnread > 0 && <span style={styles.navBadge}>{totalUnread}</span>}
          </button>
        </nav>

        {/* Current User Switcher */}
        <div style={styles.userSwitcher}>
          <label style={{ fontSize: '12px', marginRight: '6px' }}>Naka-login bilang:</label>
          <select
            value={currentUserId}
            onChange={(e) => {
              const selected = e.target.value;
              setCurrentUserId(selected);
              if (selected === targetUserId) {
                const other = users.find((u) => u.id !== selected);
                if (other) setTargetUserId(other.id);
              }
            }}
            style={styles.selectInput}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {activeTab === 'feed' ? (
          /* HOME FEED TAB */
          <div style={styles.feedContainer}>
            {/* Create Post Box */}
            <div style={styles.createPostCard}>
              <h3>Ano ang nasa isip mo?</h3>
              <form onSubmit={handleCreatePost}>
                <textarea
                  placeholder="Ibahagi ang iyong naiisip ngayon..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  style={styles.postInput}
                />
                <button type="submit" style={styles.publishBtn}>I-post</button>
              </form>
            </div>

            {/* Posts List */}
            <div style={styles.postsList}>
              {posts.map((post) => (
                <div key={post.id} style={styles.postCard}>
                  <h4 style={styles.postAuthor}>{post.author}</h4>
                  <p style={styles.postText}>{post.content}</p>
                  <div style={styles.postFooter}>
                    <button style={styles.likeBtn}>❤️ Like ({post.likes})</button>
                    <button style={styles.commentBtn}>💬 Comment</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* MESSAGES TAB */
          <div style={styles.chatSection}>
            <div style={styles.targetSelector}>
              <label><b>Piliin ang Ka-chat:</b> </label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                style={styles.selectInput}
              >
                {users
                  .filter((u) => u.id !== currentUserId)
                  .map((u) => {
                    const count = unreadMap[u.id] || 0;
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name} {count > 0 ? `🔴 (${count})` : ''}
                      </option>
                    );
                  })}
              </select>
            </div>

            <Chat
              currentUserId={currentUserId}
              targetUserId={targetUserId}
              targetUserName={targetUserName}
              onUnreadChange={handleUnreadChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}

// Inline Styles
const styles = {
  appContainer: { fontFamily: 'sans-serif', backgroundColor: '#F0F2F5', minHeight: '100vh' },
  navHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#FFF', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { margin: 0, color: '#0084FF', fontSize: '20px' },
  navButtons: { display: 'flex', gap: '10px' },
  tabBtn: { padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', position: 'relative' },
  navBadge: { backgroundColor: '#FF3B30', color: '#FFF', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', marginLeft: '5px' },
  userSwitcher: { display: 'flex', alignItems: 'center' },
  selectInput: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc' },
  mainContent: { padding: '20px', maxWidth: '600px', margin: '0 auto' },
  feedContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  createPostCard: { backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  postInput: { width: '100%', height: '70px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', resize: 'none', boxSizing: 'border-box' },
  publishBtn: { marginTop: '10px', backgroundColor: '#0084FF', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  postsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  postCard: { backgroundColor: '#FFF', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  postAuthor: { margin: '0 0 8px 0', color: '#333' },
  postText: { margin: '0 0 12px 0', color: '#555', fontSize: '14px' },
  postFooter: { display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '10px' },
  likeBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#65676B' },
  commentBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#65676B' },
  chatSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
  targetSelector: { backgroundColor: '#FFF', padding: '10px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
};

export default App;
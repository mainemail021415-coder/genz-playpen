import React, { useState } from 'react';

function HomeFeed({ onLogout }) {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Alex_Gamer',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
      time: '2 hours ago',
      content: 'Kakapanalo lang sa tournament ngayon! 🎮🔥 Sino gusto makipag-duo mamaya?',
      likes: 12,
      liked: false,
    },
    {
      id: 2,
      author: 'CodeMaster_PH',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Code',
      time: '5 hours ago',
      content: 'Sa wakas, nakapasok na rin sa Homefeed gamit ang JWT Authentication! 🚀 Code status: Deployed on Vercel & Render.',
      likes: 34,
      liked: false,
    },
  ]);

  const [newPostText, setNewPostText] = useState('');

  // Magdagdag ng bagong post sa Feed
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: 'You (Player 1)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=You',
      time: 'Just now',
      content: newPostText,
      likes: 0,
      liked: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  // Like / Unlike Toggle
  const handleLike = (id) => {
    setPosts(
      posts.map((post) => {
        if (post.id === id) {
          return {
            ...post,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
            liked: !post.liked,
          };
        }
        return post;
      })
    );
  };

  return (
    <div style={styles.appWrapper}>
      {/* 1. NAVIGATION BAR */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>🎮 GenZ Playpen</div>
          <input
            type="text"
            placeholder="Search games, posts, or friends..."
            style={styles.searchBar}
          />
          <div style={styles.userMenu}>
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=You"
              alt="Avatar"
              style={styles.navAvatar}
            />
            <button onClick={onLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* 2. MAIN LAYOUT (FEED + SIDEBAR) */}
      <div style={styles.mainLayout}>
        {/* MAIN FEED */}
        <div style={styles.feedContainer}>
          {/* CREATE POST CARD */}
          <div style={styles.card}>
            <form onSubmit={handleCreatePost}>
              <div style={styles.createPostHeader}>
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=You"
                  alt="Avatar"
                  style={styles.avatar}
                />
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="What's on your mind? Share your gameplay..."
                  rows="3"
                  style={styles.postInput}
                />
              </div>
              <div style={styles.createPostActions}>
                <div style={styles.mediaButtons}>
                  <button type="button" style={styles.iconBtn}>📸 Photo</button>
                  <button type="button" style={styles.iconBtn}>🎥 Video</button>
                  <button type="button" style={styles.iconBtn}>🔥 Vibe</button>
                </div>
                <button type="submit" style={styles.postBtn}>
                  Post
                </button>
              </div>
            </form>
          </div>

          {/* POSTS LIST */}
          {posts.map((post) => (
            <div key={post.id} style={styles.card}>
              <div style={styles.postHeader}>
                <img src={post.avatar} alt={post.author} style={styles.avatar} />
                <div>
                  <h4 style={styles.authorName}>{post.author}</h4>
                  <span style={styles.postTime}>{post.time}</span>
                </div>
              </div>

              <p style={styles.postContent}>{post.content}</p>

              <div style={styles.postFooter}>
                <button
                  onClick={() => handleLike(post.id)}
                  style={{
                    ...styles.actionBtn,
                    color: post.liked ? '#e74c3c' : '#65676b',
                  }}
                >
                  {post.liked ? '❤️' : '🤍'} {post.likes} Likes
                </button>
                <button style={styles.actionBtn}>💬 Comment</button>
                <button style={styles.actionBtn}>🔗 Share</button>
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.card}>
            <h3 style={styles.sidebarTitle}>🔥 Trending Topics</h3>
            <ul style={styles.trendingList}>
              <li>#ValorantTournament</li>
              <li>#ReactJS2026</li>
              <li>#MongoDBAtlas</li>
              <li>#GenZPlaypenVibe</li>
            </ul>
          </div>

          <div style={styles.card}>
            <h3 style={styles.sidebarTitle}>⚡ Quick Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={styles.secondaryBtn}>🎮 Play Mini-Games</button>
              <button style={styles.secondaryBtn}>👥 Find Teammates</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES OBJECT (Clean Inline CSS)
const styles = {
  appWrapper: {
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    color: '#1c1e21',
  },
  navbar: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navContainer: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#0070f3',
    letterSpacing: '-0.5px',
  },
  searchBar: {
    width: '300px',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    backgroundColor: '#f0f2f5',
    outline: 'none',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #0070f3',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  mainLayout: {
    maxWidth: '1100px',
    margin: '25px auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '25px',
  },
  feedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  createPostHeader: {
    display: 'flex',
    gap: '12px',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#eee',
  },
  postInput: {
    width: '100%',
    border: '1px solid #e4e6eb',
    borderRadius: '8px',
    padding: '10px',
    resize: 'none',
    fontFamily: 'inherit',
    outline: 'none',
  },
  createPostActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f0f2f5',
  },
  mediaButtons: {
    display: 'flex',
    gap: '10px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#65676b',
    fontWeight: '600',
    fontSize: '13px',
  },
  postBtn: {
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 24px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  authorName: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: '12px',
    color: '#65676b',
  },
  postContent: {
    fontSize: '15px',
    lineHeight: '1.5',
    margin: '0 0 15px 0',
  },
  postFooter: {
    display: 'flex',
    borderTop: '1px solid #f0f2f5',
    paddingTop: '10px',
    gap: '10px',
  },
  actionBtn: {
    flex: 1,
    padding: '8px',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#65676b',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sidebarTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    color: '#1c1e21',
  },
  trendingList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    color: '#0070f3',
    fontWeight: '600',
    fontSize: '14px',
  },
  secondaryBtn: {
    padding: '10px',
    backgroundColor: '#e7f3ff',
    color: '#0070f3',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'left',
  },
};

export default HomeFeed;
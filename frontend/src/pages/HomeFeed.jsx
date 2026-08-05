import React, { useState, useEffect } from 'react';

function HomeFeed({ onLogout }) {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const API_BASE = 'https://genz-playpen-api.onrender.com';

  // 1. KUNIN LAHAT NG POSTS MULA SA MONGODB
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. MAG-SAVE NG BAGONG POST SA MONGODB
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setIsPosting(true);

    try {
      const response = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: 'Player_1', // Puwedeng palitan ng nakasave na username sa hinaharap
          content: newPostText,
        }),
      });

      if (response.ok) {
        const savedPost = await response.json();
        // Idagdag agad ang bagong post sa itaas ng listahan sa UI
        setPosts([savedPost, ...posts]);
        setNewPostText('');
      } else {
        alert('❌ Nabigong i-share ang post. Paki-subok ulit.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('❌ Server error. Paki-check ang internet connection.');
    } finally {
      setIsPosting(false);
    }
  };

  // Local Like Toggle Effect
  const handleLike = (id) => {
    setPosts(
      posts.map((post) => {
        if (post._id === id) {
          const isLiked = post.liked;
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            liked: !isLiked,
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
              src="https://api.dicebear.com/7.x/bottts/svg?seed=Player_1"
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
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=Player_1"
                  alt="Avatar"
                  style={styles.avatar}
                />
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="What's on your mind? Share your gameplay or thoughts..."
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
                <button
                  type="submit"
                  disabled={isPosting}
                  style={{
                    ...styles.postBtn,
                    backgroundColor: isPosting ? '#93c5fd' : '#0070f3',
                  }}
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>

          {/* POSTS LIST FROM MONGODB */}
          {loading ? (
            <div style={styles.card}>
              <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
                ⏳ Loading posts from MongoDB...
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div style={styles.card}>
              <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
                🎉 Wala pang posts! Maging una sa pag-post sa GenZ Playpen.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} style={styles.card}>
                <div style={styles.postHeader}>
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${post.author}`}
                    alt={post.author}
                    style={styles.avatar}
                  />
                  <div>
                    <h4 style={styles.authorName}>{post.author}</h4>
                    <span style={styles.postTime}>
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p style={styles.postContent}>{post.content}</p>

                <div style={styles.postFooter}>
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{
                      ...styles.actionBtn,
                      color: post.liked ? '#e74c3c' : '#65676b',
                    }}
                  >
                    {post.liked ? '❤️' : '🤍'} {post.likes || 0} Likes
                  </button>
                  <button style={styles.actionBtn}>💬 Comment</button>
                  <button style={styles.actionBtn}>🔗 Share</button>
                </div>
              </div>
            ))
          )}
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

// INLINE STYLES OBJECT
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
    boxSizing: 'border-box',
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
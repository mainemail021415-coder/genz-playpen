import React, { useState, useEffect } from 'react';

function HomeFeed({ user, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  const currentUsername = user?.username || 'Anonymous GenZ';
  const API_BASE = 'https://genz-playpen-api.onrender.com';

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

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
  }, []);

  // Handlers para sa pagpili ng image file
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

  // 🚀 CREATE POST WITH FORM DATA (Kailangan para sa Files)
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
        body: formData, // Puno ng text at file
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

  return (
    <div style={styles.appWrapper}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>🎮 GenZ Playpen</div>
          <div style={styles.userMenu}>
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`}
              alt="Avatar"
              style={styles.navAvatar}
            />
            <span style={styles.profileName}>@{currentUsername}</span>
            <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div style={styles.mainLayout}>
        <div style={styles.feedContainer}>
          {/* CREATE POST CARD WITH FILE CHOOSE */}
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

              {/* IMAGE PREVIEW BEFORE UPLOADING */}
              {imagePreview && (
                <div style={{ position: 'relative', marginTop: '10px' }}>
                  <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                  <button type="button" onClick={removeSelectedImage} style={styles.removeImageBtn}>
                    ✖
                  </button>
                </div>
              )}

              <div style={styles.createPostActions}>
                {/* FILE INPUT (CHOOSE FILE BUTTON) */}
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

          {/* POSTS LIST */}
          {loading ? (
            <p style={{ textAlign: 'center' }}>⏳ Loading posts...</p>
          ) : posts.map((post) => {
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

                {/* 📸 IF POST HAS AN UPLOADED IMAGE */}
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post content" style={styles.postImage} />
                )}

                {/* POST ACTIONS */}
                <div style={styles.postFooter}>
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{ ...styles.actionBtn, color: isLiked ? '#e74c3c' : '#65676b' }}
                  >
                    {isLiked ? '❤️' : '🤍'} {post.likes?.length || 0} Likes
                  </button>
                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center' }}>
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`}
                alt="Profile"
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              />
              <h3 style={{ margin: '10px 0 0 0' }}>@{currentUsername}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  appWrapper: { backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' },
  navbar: { backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '10px 0' },
  navContainer: { maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center' },
  logo: { fontSize: '20px', fontWeight: 'bold', color: '#0070f3' },
  userMenu: { display: 'flex', alignItems: 'center', gap: '10px' },
  profileName: { fontWeight: 'bold' },
  navAvatar: { width: '32px', height: '32px', borderRadius: '50%' },
  logoutBtn: { backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' },
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
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' }
};

export default HomeFeed;
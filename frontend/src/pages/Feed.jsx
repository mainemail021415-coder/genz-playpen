import React, { useState, useEffect } from 'react';

// LIVE BACKEND API URL (Gamit ang iyong domain)
const API_BASE_URL = 'https://api.genziplaypen.online';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // 1. Fetch Posts mula sa Live Backend
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      } else {
        console.error('Error fetching posts:', data.message);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPosts();
  }, [token]);

  // Handle Image Selection at Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 2. Create New Post (Text + Image Upload)
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    try {
      setPosting(true);
      const formData = new FormData();
      formData.append('content', content);
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const newPost = await res.json();
      if (res.ok) {
        setPosts([newPost, ...posts]);
        setContent('');
        setImageFile(null);
        setPreviewUrl('');
      } else {
        alert(newPost.message || 'Error sa paggawa ng post');
      }
    } catch (err) {
      console.error('Create post error:', err);
    } finally {
      setPosting(false);
    }
  };

  // 3. Like / Unlike Post Action
  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setPosts(posts.map(post => 
          post._id === postId ? { ...post, likes: data.likes } : post
        ));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // 4. Add Comment Action
  const handleAddComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      if (res.ok) {
        setPosts(posts.map(post => 
          post._id === postId ? { ...post, comments: data.comments } : post
        ));
        setCommentText({ ...commentText, [postId]: '' });
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Create Post Card */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Ano'ng bago sa'yo, GenZ? 🚀</h3>
        <form onSubmit={handleCreatePost}>
          <textarea
            style={styles.textarea}
            placeholder="Ibahagi ang naiisip mo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />

          {previewUrl && (
            <div style={{ marginBottom: '10px' }}>
              <img src={previewUrl} alt="Preview" style={styles.imagePreview} />
            </div>
          )}

          <div style={styles.formFooter}>
            <label style={styles.fileLabel}>
              📷 Magdagdag ng Larawan
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>

            <button type="submit" disabled={posting} style={styles.postButton}>
              {posting ? 'Ipinapasa...' : 'I-post'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed Posts List */}
      {loading ? (
        <p style={styles.statusText}>Kinukuha ang mga posts mula sa genziplaypen.online...</p>
      ) : posts.length === 0 ? (
        <p style={styles.statusText}>Wala pang posts. Maging una sa pag-post!</p>
      ) : (
        posts.map((post) => {
          const currentUserId = currentUser._id || currentUser.id;
          const isLiked = post.likes?.includes(currentUserId);

          return (
            <div key={post._id} style={styles.card}>
              {/* User Header */}
              <div style={styles.postHeader}>
                <img 
                  src={post.user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Fallback'} 
                  alt="Avatar" 
                  style={styles.avatar} 
                />
                <div>
                  <strong style={styles.userName}>{post.user?.name || 'GenZ User'}</strong>
                  <div style={styles.timestamp}>
                    {new Date(post.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Text and Image Content */}
              {post.content && <p style={styles.postText}>{post.content}</p>}
              {post.image && <img src={post.image} alt="Post media" style={styles.postImage} />}

              {/* Actions Section */}
              <div style={styles.actions}>
                <button 
                  onClick={() => handleLike(post._id)} 
                  style={{
                    ...styles.likeBtn,
                    color: isLiked ? '#e74c3c' : '#555',
                    fontWeight: isLiked ? 'bold' : 'normal'
                  }}
                >
                  {isLiked ? '❤️ Liked' : '🤍 Like'} ({post.likes?.length || 0})
                </button>
                <span style={styles.commentCount}>
                  💬 {post.comments?.length || 0} Comments
                </span>
              </div>

              {/* Comment Input */}
              <div style={styles.commentInputBox}>
                <input
                  type="text"
                  placeholder="Mag-iwan ng komento..."
                  value={commentText[post._id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                  style={styles.commentInput}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                />
                <button onClick={() => handleAddComment(post._id)} style={styles.sendBtn}>
                  Ipadala
                </button>
              </div>

              {/* Comments Display */}
              {post.comments && post.comments.length > 0 && (
                <div style={styles.commentsList}>
                  {post.comments.map((comment, index) => (
                    <div key={comment._id || index} style={styles.commentItem}>
                      <strong>{comment.user?.name || 'User'}: </strong>
                      <span>{comment.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

// Inline CSS Styles
const styles = {
  container: { maxWidth: '600px', margin: '20px auto', padding: '0 15px', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { marginTop: 0, marginBottom: '12px', color: '#111', fontSize: '18px' },
  textarea: { width: '100%', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '10px', boxSizing: 'border-box', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' },
  formFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' },
  fileLabel: { cursor: 'pointer', color: '#4A90E2', fontSize: '14px', fontWeight: '600' },
  postButton: { backgroundColor: '#4A90E2', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
  imagePreview: { width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px' },
  postHeader: { display: 'flex', alignItems: 'center', marginBottom: '12px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', marginRight: '12px', objectFit: 'cover' },
  userName: { fontSize: '15px', color: '#222' },
  timestamp: { fontSize: '12px', color: '#888', marginTop: '2px' },
  postText: { fontSize: '15px', color: '#333', marginBottom: '12px', lineHeight: '1.4' },
  postImage: { width: '100%', borderRadius: '8px', marginBottom: '12px', maxHeight: '400px', objectFit: 'cover' },
  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '8px 0', marginBottom: '12px' },
  likeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' },
  commentCount: { fontSize: '13px', color: '#666' },
  commentInputBox: { display: 'flex', gap: '8px', marginBottom: '10px' },
  commentInput: { flex: 1, padding: '8px 14px', borderRadius: '20px', border: '1px solid #e0e0e0', fontSize: '13px', outline: 'none' },
  sendBtn: { backgroundColor: '#f0f2f5', border: 'none', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  commentsList: { backgroundColor: '#f8f9fa', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' },
  commentItem: { marginBottom: '6px' },
  statusText: { textAlign: 'center', color: '#666', marginTop: '30px' }
};

export default Feed;
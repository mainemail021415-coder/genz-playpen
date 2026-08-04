import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Feed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [commentInput, setCommentInput] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Kunin ang Current User ID mula sa JWT Token
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

  // 1. FETCH LAHAT NG POSTS
  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Bigo sa pag-load ng posts.');
      const data = await res.json();
      setPosts(data || []);
    } catch (err) {
      console.error('Fetch posts error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. CREATE NEW POST
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content, image })
      });

      if (res.ok) {
        setContent('');
        setImage('');
        fetchPosts(); // Reload feed
      }
    } catch (err) {
      console.error('Create post error:', err);
    }
  };

  // 3. LIKE / UNLIKE POST WITH REAL-TIME NOTIFICATION TRIGGER
  const handleLike = async (postId, postAuthorId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchPosts();

        // Mag-emit sa Socket.io kapag nag-like ka sa post ng ibang tao
        if (postAuthorId && postAuthorId !== currentUserId) {
          socket.emit('send_notification', {
            receiverId: postAuthorId,
            senderId: currentUserId,
            type: 'like',
            postId
          });
        }
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // 4. ADD COMMENT WITH REAL-TIME NOTIFICATION TRIGGER
  const handleAddComment = async (postId, postAuthorId) => {
    const text = commentInput[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        setCommentInput({ ...commentInput, [postId]: '' });
        fetchPosts();

        // Mag-emit sa Socket.io kapag nag-comment ka sa post ng ibang tao
        if (postAuthorId && postAuthorId !== currentUserId) {
          socket.emit('send_notification', {
            receiverId: postAuthorId,
            senderId: currentUserId,
            type: 'comment',
            postId
          });
        }
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '20px auto', padding: '0 15px', color: '#f8fafc' }}>
      {/* --- CREATE POST BOX --- */}
      <div
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#a855f7' }}>
          ✨ Ano ang nasa isip mo?
        </h3>
        <form onSubmit={handleCreatePost}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ibahagi ang iyong naiisip..."
            rows="3"
            style={{
              width: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#fff',
              padding: '12px',
              fontSize: '0.95rem',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Image URL (opsyonal)..."
            style={{
              width: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              padding: '8px 12px',
              fontSize: '0.85rem',
              marginTop: '10px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: '12px',
              backgroundColor: '#a855f7',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              float: 'right'
            }}
          >
            I-Post 🚀
          </button>
          <div style={{ clear: 'both' }}></div>
        </form>
      </div>

      {/* --- LOADING & ERROR STATES --- */}
      {loading && <p style={{ textAlign: 'center', color: '#94a3b8' }}>Iniloload ang feed...</p>}
      {error && <p style={{ textAlign: 'center', color: '#ef4444' }}>{error}</p>}

      {/* --- POSTS LIST --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.map((post) => {
          const isLiked = post.likes?.includes(currentUserId);
          const authorId = post.user?._id || post.author?._id;
          const authorName = post.user?.name || post.author?.name || 'Anonymous';
          const authorAvatar =
            post.user?.avatar || post.author?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Fallback';

          return (
            <div
              key={post._id}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px'
              }}
            >
              {/* User Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Link to={`/profile/${authorId}`}>
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #a855f7'
                    }}
                  />
                </Link>
                <div>
                  <Link
                    to={`/profile/${authorId}`}
                    style={{ fontWeight: 'bold', color: '#f8fafc', textDecoration: 'none' }}
                  >
                    {authorName}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Post Text Content */}
              {post.content && (
                <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5', color: '#e2e8f0' }}>
                  {post.content}
                </p>
              )}

              {/* Post Image Content */}
              {post.image && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                  <img src={post.image} alt="Post" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                </div>
              )}

              {/* Actions: Like Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '12px',
                  marginBottom: '15px'
                }}
              >
                <button
                  onClick={() => handleLike(post._id, authorId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isLiked ? '#ec4899' : '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem'
                  }}
                >
                  {isLiked ? '❤️ Liked' : '🤍 Like'} ({post.likes?.length || 0})
                </button>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  💬 {post.comments?.length || 0} Comments
                </span>
              </div>

              {/* Comments Section */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
                {/* Comment Input */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Mag-iwan ng comment..."
                    value={commentInput[post._id] || ''}
                    onChange={(e) => setCommentInput({ ...commentInput, [post._id]: e.target.value })}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleAddComment(post._id, authorId)}
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      border: '1px solid #a855f7',
                      color: '#a855f7',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Ipadala
                  </button>
                </div>

                {/* Display Comments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {post.comments?.slice(0, 3).map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <strong style={{ color: '#a855f7', marginRight: '6px' }}>
                        {c.user?.name || c.author?.name || 'User'}:
                      </strong>
                      <span>{c.text || c.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Feed;
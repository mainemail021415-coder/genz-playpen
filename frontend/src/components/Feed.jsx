// frontend/src/components/Feed.jsx
import React, { useState, useEffect } from 'react';

export default function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load Posts mula sa Backend
  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle Submit / Create Post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content && !image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('username', user.username);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await fetch('http://localhost:5000/api/posts/create', {
        method: 'POST',
        body: formData, // Automatic handling ng multipart/form-data
      });

      if (res.ok) {
        setContent('');
        setImage(null);
        // I-clear ang file input
        document.getElementById('file-input').value = '';
        fetchPosts(); // Reload Feed
      }
    } catch (error) {
      alert("Error posting content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      
      {/* ===== POST CREATION BOX ===== */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>✨ Anong nasa isip mo, {user.username}?</h3>
        <form onSubmit={handlePostSubmit}>
          <textarea
            placeholder="Magsulat ng post dito..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', resize: 'none', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            {/* Image File Input */}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ fontSize: '12px' }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#8c52ff', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* ===== POSTS FEED LIST ===== */}
      <div>
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Wala pang posts. Ikaw ang unang mag-post!</p>
        ) : (
          posts.map((post) => (
            <div key={post._id || post.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '15px' }}>
              {/* User Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8c52ff', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                  {post.username ? post.username[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{post.username}</h4>
                  <span style={{ fontSize: '11px', color: '#888' }}>
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <p style={{ margin: '10px 0', fontSize: '15px', color: '#333' }}>{post.content}</p>

              {/* Attached Image */}
              {post.image && (
                <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img
                    src={`http://localhost:5000${post.image}`}
                    alt="Post Attachment"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
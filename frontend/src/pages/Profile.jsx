import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Profile({ currentUser }) {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [wallComment, setWallComment] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://genz-playpen-api.onrender.com';

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/profile/${username}`);
      if (response.ok) {
        const data = await response.json();
        setProfileUser(data.user);
        setPosts(data.posts);
        setIsFollowing(data.user.followers?.includes(currentUser.username));
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/${username}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUsername: currentUser.username }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        fetchProfileData(); // Reload stats
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleAddWallComment = async (e) => {
    e.preventDefault();
    if (!wallComment.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${username}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentUser.username, text: wallComment }),
      });

      if (response.ok) {
        setWallComment('');
        fetchProfileData();
      }
    } catch (err) {
      console.error('Wall comment error:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading profile...</div>;
  if (!profileUser) return <div style={{ textAlign: 'center', marginTop: '40px' }}>User not found.</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      {/* Profile Header */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h2>👤 @{profileUser.username}</h2>
        <p style={{ color: '#666' }}>{profileUser.bio || 'Walang bio.'}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '15px 0' }}>
          <div><strong>{profileUser.followers?.length || 0}</strong> Followers</div>
          <div><strong>{profileUser.following?.length || 0}</strong> Following</div>
        </div>

        {currentUser.username !== username && (
          <button
            onClick={handleFollowToggle}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: isFollowing ? '#ccc' : '#007bff',
              color: isFollowing ? '#333' : '#fff',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      {/* User Posts */}
      <h3 style={{ marginTop: '30px' }}>📝 Posts ni @{username}</h3>
      {posts.length === 0 ? (
        <p style={{ color: '#777' }}>Wala pang nai-post na content.</p>
      ) : (
        posts.map((p) => (
          <div key={p._id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', margin: '10px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p>{p.content}</p>
            {p.imageUrl && <img src={p.imageUrl} alt="post" style={{ maxWidth: '100%', borderRadius: '6px' }} />}
            <small style={{ color: '#888' }}>{new Date(p.createdAt).toLocaleDateString()}</small>
          </div>
        ))
      )}

      {/* Profile Wall Comments */}
      <h3 style={{ marginTop: '30px' }}>💬 Profile Wall</h3>
      <form onSubmit={handleAddWallComment} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Mag-iwan ng mensahe sa wall..."
          value={wallComment}
          onChange={(e) => setWallComment(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Post
        </button>
      </form>

      {profileUser.profileComments?.map((c, index) => (
        <div key={index} style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '5px', marginBottom: '8px' }}>
          <strong>@{c.author}:</strong> {c.text}
        </div>
      ))}
    </div>
  );
}

export default Profile;
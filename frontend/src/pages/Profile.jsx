import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Kunin ang kasalukuyang logged-in User ID mula sa JWT Token
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

  // Kung walang valid na userId sa URL, gamitin ang sariling currentUserId
  const targetUserId = (userId && userId !== 'undefined') ? userId : currentUserId;
  const isSelf = String(targetUserId) === String(currentUserId);

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5000/api/users/${targetUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfileUser(data.user);
          setUserPosts(data.posts || []);
          setStats({
            followers: data.followersCount || 0,
            following: data.followingCount || 0
          });
        } else {
          setProfileUser(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Profile fetch error:', err);
        setLoading(false);
      });
  }, [targetUserId]);

  // Handle Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Sigurado ka bang gusto mong burahin ang post na ito?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setUserPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Handle Follow / Unfollow Toggle
  const handleFollowToggle = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/follow/${targetUserId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Loading Profile...</div>;
  }

  if (!profileUser) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>
        <h3>User not found.</h3>
        <button 
          onClick={() => navigate('/')}
          style={{ padding: '8px 16px', background: '#a855f7', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
        >
          Back to Feed
        </button>
      </div>
    );
  }

  const isFollowing = profileUser.followers?.some((id) => String(id) === String(currentUserId));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '20px 15px' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>

        {/* Profile Card Header */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '20px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '2rem',
              color: '#fff',
              margin: '0 auto 15px auto'
            }}
          >
            {profileUser.name ? profileUser.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>{profileUser.name}</h2>
          <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.9rem' }}>{profileUser.email}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', margin: '15px 0' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#a855f7' }}>{stats.followers}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Followers</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#ec4899' }}>{stats.following}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Following</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8' }}>{userPosts.length}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Posts</div>
            </div>
          </div>

          {!isSelf && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={handleFollowToggle}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  backgroundColor: isFollowing ? 'transparent' : '#a855f7',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {isFollowing ? 'Following' : '+ Follow'}
              </button>

              <button
                onClick={() => navigate(`/chat?user=${targetUserId}`)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                💬 Message
              </button>
            </div>
          )}
        </div>

        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#cbd5e1' }}>Posts</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {userPosts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>No posts published yet.</p>
          ) : (
            userPosts.map((post) => (
              <div
                key={post._id}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '16px',
                  padding: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}
                  </span>

                  {/* Delete Button para sa sariling mga post sa Profile */}
                  {isSelf && (
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      title="Delete Post"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>

                <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.95rem' }}>
                  {post.content || post.text}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  useEffect(() => {
    // Fetch User Profile
    fetch(`http://localhost:5000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      });

    // Check if following
    if (token) {
      fetch('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((me) => {
          if (me.following?.includes(userId)) {
            setIsFollowing(true);
          }
        });
    }
  }, [userId, token]);

  const handleFollowToggle = async () => {
    if (!token) return alert('Please login to follow users');
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/follow`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setUser({ ...user, followers: Array(data.followersCount) });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>Loading profile...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', padding: '2rem 10px' }}>
      <div
        style={{
          maxWidth: '500px',
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        <h2 style={{ fontSize: '1.5rem', margin: '0' }}>{user.name}</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{user.email}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', margin: '1.5rem 0' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.followers?.length || 0}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Followers</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.following?.length || 0}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Following</div>
          </div>
        </div>

        <button
          onClick={handleFollowToggle}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '14px',
            border: 'none',
            background: isFollowing ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(90deg, #a855f7, #ec4899)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          {isFollowing ? 'Following ✨' : '+ Follow User'}
        </button>
      </div>
    </div>
  );
}

export default UserProfile;
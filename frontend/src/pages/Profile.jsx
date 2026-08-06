import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = 'https://genz-playpen-api.onrender.com'; // Palitan kung iba ang backend URL mo

function Profile({ currentUser }) {
  const { username } = useParams(); // Kukunin ang username mula sa URL (/profile/:username)
  const loggedInUsername = currentUser?.username || 'Anonymous';

  // --- STATES ---
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile Comments State (Guestbook / Wall)
  const [profileComments, setProfileComments] = useState([]);
  const [newProfileComment, setNewProfileComment] = useState('');

  // Post Interactions State
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [postCommentInput, setPostCommentInput] = useState('');

  // --- DYNAMIC TIME AGO FORMATTER ---
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 10) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // --- FETCH PROFILE DATA & POSTS ---
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/users/profile/${username}`);
      if (res.ok) {
        const data = await res.json();
        setProfileUser(data.user);
        setUserPosts(data.posts || []);
        setProfileComments(data.user?.profileComments || []);

        // Suriin kung naka-follow na ang kasalukuyang logged-in user
        if (data.user?.followers && data.user.followers.includes(loggedInUsername)) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      } else {
        console.error('Failed to fetch user profile.');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfileData();
    }
  }, [username, loggedInUsername]);

  // --- TOGGLE FOLLOW / UNFOLLOW ---
  const handleFollowToggle = async () => {
    if (username === loggedInUsername) {
      return alert('Hindi mo pwedeng i-follow ang sarili mo.');
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/${username}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUsername: loggedInUsername })
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);

        // Update Followers count sa UI nang realtime
        setProfileUser((prev) => {
          if (!prev) return prev;
          const updatedFollowers = data.isFollowing
            ? [...prev.followers, loggedInUsername]
            : prev.followers.filter((u) => u !== loggedInUsername);

          return { ...prev, followers: updatedFollowers };
        });
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  // --- ADD PROFILE COMMENT (WALL / GUESTBOOK) ---
  const handleAddProfileComment = async (e) => {
    e.preventDefault();
    if (!newProfileComment.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/${username}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: loggedInUsername,
          text: newProfileComment
        })
      });

      if (res.ok) {
        const commentObj = {
          author: loggedInUsername,
          text: newProfileComment,
          createdAt: new Date().toISOString()
        };
        setProfileComments([commentObj, ...profileComments]);
        setNewProfileComment('');
      }
    } catch (err) {
      console.error('Error adding profile comment:', err);
    }
  };

  // --- POST INTERACTIONS: LIKE ---
  const handleLikePost = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedInUsername })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setUserPosts(userPosts.map((p) => (p._id === postId ? updatedPost : p)));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // --- POST INTERACTIONS: COMMENT ---
  const handleAddPostComment = async (postId) => {
    if (!postCommentInput.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: loggedInUsername, text: postCommentInput })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setUserPosts(userPosts.map((p) => (p._id === postId ? updatedPost : p)));
        setPostCommentInput('');
      }
    } catch (err) {
      console.error('Post comment error:', err);
    }
  };

  // --- POST INTERACTIONS: DELETE ---
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Sigurado ka bang gusto mo itong burahin?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedInUsername })
      });

      if (res.ok) {
        setUserPosts(userPosts.filter((p) => p._id !== postId));
      }
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  if (loading) {
    return <div style={styles.loadingContainer}>⏳ Loading user profile...</div>;
  }

  if (!profileUser) {
    return <div style={styles.notFoundContainer}>❌ User hindi nahanap.</div>;
  }

  const isOwnProfile = username === loggedInUsername;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* TOP NAVIGATION LINK */}
        <Link to="/" style={styles.backLink}>
          ⬅ Back to Feed
        </Link>

        {/* 👤 PROFILE HEADER CARD */}
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${profileUser.username}`}
              alt="Avatar"
              style={styles.avatar}
            />
            <div style={styles.profileInfo}>
              <h2 style={styles.usernameTitle}>@{profileUser.username}</h2>
              <p style={styles.bioText}>{profileUser.bio || 'Wala pang bio na nilagay.'}</p>

              {/* STATS COUNTER */}
              <div style={styles.statsContainer}>
                <div style={styles.statBox}>
                  <b>{userPosts.length}</b>
                  <span>Posts</span>
                </div>
                <div style={styles.statBox}>
                  <b>{profileUser.followers?.length || 0}</b>
                  <span>Followers</span>
                </div>
                <div style={styles.statBox}>
                  <b>{profileUser.following?.length || 0}</b>
                  <span>Following</span>
                </div>
              </div>

              {/* ACTION BUTTON */}
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  style={{
                    ...styles.followBtn,
                    backgroundColor: isFollowing ? '#e4e6eb' : '#0070f3',
                    color: isFollowing ? '#000' : '#fff'
                  }}
                >
                  {isFollowing ? '✓ Following' : '+ Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 💬 PROFILE WALL / GUESTBOOK COMMENTS */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>💬 Profile Wall Comments</h3>
          <form onSubmit={handleAddProfileComment} style={styles.commentForm}>
            <input
              type="text"
              placeholder={`Mag-iwan ng comment sa profile ni @${profileUser.username}...`}
              value={newProfileComment}
              onChange={(e) => setNewProfileComment(e.target.value)}
              style={styles.inputField}
            />
            <button type="submit" style={styles.sendBtn}>
              Comment
            </button>
          </form>

          {profileComments.length === 0 ? (
            <p style={styles.emptyText}>Wala pang nag-iiwan ng comment sa profile na ito.</p>
          ) : (
            profileComments.map((c, idx) => (
              <div key={idx} style={styles.wallCommentBox}>
                <div style={styles.wallCommentHeader}>
                  {/* CLICKABLE USERNAME LINK */}
                  <Link to={`/profile/${c.author}`} style={styles.clickableUsername}>
                    @{c.author}
                  </Link>
                  <span style={styles.timeText}>{formatTimeAgo(c.createdAt)}</span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{c.text}</p>
              </div>
            ))
          )}
        </div>

        {/* 📝 USER'S POSTS FEED */}
        <h3 style={styles.sectionTitle}>📸 Posts by @{profileUser.username}</h3>
        {userPosts.length === 0 ? (
          <div style={styles.card}>
            <p style={styles.emptyText}>Wala pang naipopost na larawan o text ang user na ito.</p>
          </div>
        ) : (
          userPosts.map((post) => {
            const isLiked = post.likes?.includes(loggedInUsername);

            return (
              <div key={post._id} style={styles.card}>
                <div style={styles.postHeader}>
                  {/* CLICKABLE AVATAR */}
                  <Link to={`/profile/${post.author}`}>
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${post.author}`}
                      alt="Avatar"
                      style={styles.smallAvatar}
                    />
                  </Link>
                  <div style={{ flex: 1, marginLeft: '10px' }}>
                    {/* CLICKABLE AUTHOR USERNAME */}
                    <Link to={`/profile/${post.author}`} style={{ textDecoration: 'none', color: '#000' }}>
                      <h4 style={{ margin: 0 }}>@{post.author}</h4>
                    </Link>
                    <span style={styles.timeText}>{formatTimeAgo(post.createdAt)}</span>
                  </div>

                  {isOwnProfile && (
                    <button onClick={() => handleDeletePost(post._id)} style={styles.deleteBtn}>
                      🗑️
                    </button>
                  )}
                </div>

                {post.content && <p style={styles.postContent}>{post.content}</p>}

                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Attachment" style={styles.postImage} />
                )}

                <div style={styles.postFooter}>
                  <button
                    onClick={() => handleLikePost(post._id)}
                    style={{ ...styles.actionBtn, color: isLiked ? '#e74c3c' : '#555' }}
                  >
                    {isLiked ? '❤️' : '🤍'} {post.likes?.length || 0} Likes
                  </button>
                  <button
                    onClick={() =>
                      setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)
                    }
                    style={styles.actionBtn}
                  >
                    💬 {post.comments?.length || 0} Comments
                  </button>
                </div>

                {/* POST COMMENTS DROPDOWN */}
                {activeCommentPostId === post._id && (
                  <div style={styles.commentSection}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        placeholder="Mag-comment sa post..."
                        value={postCommentInput}
                        onChange={(e) => setPostCommentInput(e.target.value)}
                        style={styles.inputField}
                      />
                      <button
                        onClick={() => handleAddPostComment(post._id)}
                        style={styles.sendBtn}
                      >
                        Send
                      </button>
                    </div>

                    {post.comments?.map((c, i) => (
                      <div key={i} style={styles.postCommentBox}>
                        <Link to={`/profile/${c.author}`} style={styles.clickableUsername}>
                          @{c.author}
                        </Link>
                        : {c.text}
                        <div style={styles.timeText}>{formatTimeAgo(c.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// STYLES OBJECT
const styles = {
  pageWrapper: { backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px 0', fontFamily: 'sans-serif' },
  container: { maxWidth: '700px', margin: '0 auto', padding: '0 15px' },
  loadingContainer: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
  notFoundContainer: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#e74c3c' },
  backLink: { textDecoration: 'none', color: '#0070f3', fontWeight: 'bold', display: 'inline-block', marginBottom: '15px' },
  profileCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' },
  profileHeader: { display: 'flex', gap: '20px', alignItems: 'center' },
  avatar: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#eee' },
  smallAvatar: { width: '38px', height: '38px', borderRadius: '50%' },
  profileInfo: { flex: 1 },
  usernameTitle: { margin: '0 0 4px 0', fontSize: '22px' },
  bioText: { margin: '0 0 12px 0', color: '#666', fontSize: '14px' },
  statsContainer: { display: 'flex', gap: '20px', marginBottom: '14px' },
  statBox: { display: 'flex', flexDirection: 'column', fontSize: '13px', color: '#555' },
  followBtn: { border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '15px' },
  sectionTitle: { fontSize: '16px', margin: '0 0 12px 0', color: '#333' },
  commentForm: { display: 'flex', gap: '8px', marginBottom: '15px' },
  inputField: { flex: 1, padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none' },
  sendBtn: { backgroundColor: '#0070f3', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  emptyText: { textAlign: 'center', color: '#888', fontSize: '13px', margin: '10px 0' },
  wallCommentBox: { backgroundColor: '#f7f8fa', padding: '10px', borderRadius: '6px', marginBottom: '8px' },
  wallCommentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  clickableUsername: { textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' },
  timeText: { fontSize: '11px', color: '#888' },
  postHeader: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  postContent: { fontSize: '15px', marginBottom: '12px' },
  postImage: { width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' },
  postFooter: { display: 'flex', borderTop: '1px solid #eee', paddingTop: '10px', gap: '10px' },
  actionBtn: { flex: 1, padding: '6px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  commentSection: { marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' },
  postCommentBox: { backgroundColor: '#f0f2f5', padding: '8px 12px', borderRadius: '6px', marginTop: '6px', fontSize: '13px' }
};

export default Profile;
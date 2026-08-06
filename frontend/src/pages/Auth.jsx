import React, { useState } from 'react';

function Auth() {
  const [isLogin, setIsLogin] = useState(false); // Toggle sa pagitan ng Login at Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Direct Render URL para sa ating backend
  const API_URL = 'https://genz-playpen-api.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Gamitin ang /api/register o /api/login batay sa napiling mode
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setMessage('✅ Matagumpay na nakapag-login!');
          // I-save ang user info sa localStorage kung kinakailangan
          localStorage.setItem('user', JSON.stringify(data.user));
          // I-redirect sa home pagkatapos ng 1 segundo
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          setMessage('✅ Matagumpay na nakagawa ng account! Puwede ka nang mag-login.');
          setIsLogin(true); // Lumipat sa Login tab pagkatapos mag-register
        }
        setUsername('');
        setPassword('');
      } else {
        setMessage(`❌ Error: ${data.message || 'May naganap na error.'}`);
      }
    } catch (error) {
      console.error('Auth Error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h2>🎮 GenZiPlaypen {isLogin ? 'Login' : 'Register'}</h2>

      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', backgroundColor: '#f0f0f0', wordBreak: 'break-word' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Pina-process...' : (isLogin ? 'Mag-login' : 'Gumawa ng Account')}
        </button>
      </form>

      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        {isLogin ? "Wala ka pang account? " : "May account ka na? "}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage('');
          }}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'Mag-register dito' : 'Mag-login dito'}
        </button>
      </p>
    </div>
  );
}

export default Auth;
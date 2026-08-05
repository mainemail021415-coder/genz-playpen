import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Mode toggle (Login vs Register)
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Pinipili ang tamang API endpoint depende kung Login o Register
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    const fullUrl = `https://genz-playpen-api.onrender.com${endpoint}`;

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
          setMessage('✅ Account created! Puwede ka nang mag-login.');
          setIsRegistering(false); // Awtomatikong lilipat sa Login mode
        } else {
          setMessage('✅ Login successful! Redirecting...');
          
          if (data.token) {
            // Isave ang token sa localStorage
            localStorage.setItem('token', data.token);
            
            // Tawagin ang parent function sa App.jsx para lumipat agad sa Homefeed
            if (onLoginSuccess) {
              onLoginSuccess(data.token);
            }
          } else {
            setMessage('❌ Walang natanggap na token mula sa server.');
          }
        }
      } else {
        setMessage(`❌ Error: ${data.message || 'Maling credentials'}`);
      }
    } catch (error) {
      console.error('API Error:', error);
      setMessage('❌ Hindi makakonekta sa server. Paki-check ang internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '50px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        🎮 GenZ Playpen - {isRegistering ? 'Register' : 'Login'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="I-type ang username"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="I-type ang password"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: isRegistering ? '#28a745' : '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : isRegistering ? 'Register Account' : 'Log In'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '15px', padding: '10px', borderRadius: '5px', backgroundColor: message.includes('✅') ? '#e6fffa' : '#ffebe9', color: message.includes('✅') ? '#0e6251' : '#c0392b', fontSize: '14px', textAlign: 'center' }}>
          {message}
        </div>
      )}

      <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

      <p style={{ textAlign: 'center', fontSize: '14px', margin: 0 }}>
        {isRegistering ? 'May account ka na?' : 'Wala ka pang account?'} {' '}
        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setMessage('');
          }}
          style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          {isRegistering ? 'Mag-login dito' : 'Mag-register dito'}
        </button>
      </p>
    </div>
  );
}

export default Login;
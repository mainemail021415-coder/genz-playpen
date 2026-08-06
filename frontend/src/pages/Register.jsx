import React, { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('https://genz-playpen-api.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Matagumpay na nakagawa ng account!');
        setUsername('');
        setPassword('');
      } else {
        setMessage(`❌ Error: ${data.message || 'Hindi makaregister.'}`);
      }
    } catch (error) {
      console.error('EKSAKTONG ERROR:', error);
      // Ipakita ang mismong detalye ng error sa screen
      setMessage(`❌ Error details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h2>🎮 GenZiPlaypen Register</h2>

      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', backgroundColor: '#f0f0f0', wordBreak: 'break-word' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
          {loading ? 'Gumagawa ng Account...' : 'Gumawa ng Account'}
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        May account ka na? <a href="/login">Mag-login dito</a>
      </p>
    </div>
  );
}

export default Register;
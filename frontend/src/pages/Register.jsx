import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Kukunin ang URL galing sa .env (VITE_API_URL) o magfa-fallback sa Render link
  const API_URL = import.meta.env.VITE_API_URL || 'https://genz-playpen-api.onrender.com';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Matagumpay na nakagawa ng account!');
        setFormData({ username: '', email: '', password: '' });
      } else {
        setMessage(`❌ Error: ${data.message || 'Hindi makaregister.'}`);
      }
    } catch (error) {
      console.error('Register Error:', error);
      setMessage('❌ Hindi makakonekta sa Backend server. Siguraduhing active ang Render backend!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h2>🎮 GenZiPlaypen Register</h2>

      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', backgroundColor: '#f0f0f0', fontSize: '14px' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
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
    </div>
  );
}

export default Register;
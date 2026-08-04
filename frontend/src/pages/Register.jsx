import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Pakiusap, punan ang lahat ng field.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        // I-save ang token at user info
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert('✅ Rehistrasyon matagumpay!');
        navigate('/'); // Pumunta sa Feed/Home
      } else {
        setError(data.message || 'Bigo ang pag-register.');
      }
    } catch (err) {
      setError('Hindi makakonekta sa server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#a855f7', marginBottom: '8px', textAlign: 'center' }}>🚀 Sumali Na!</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>
          Lumikha ng iyong account
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Buong Pangalan</label>
            <input
              type="text"
              name="name"
              placeholder="Juan Dela Cruz"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="juan@example.com"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Rinerehistro...' : 'Mag-Register 🎯'}
          </button>
        </form>

        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '20px', textAlign: 'center' }}>
          May account ka na?{' '}
          <Link to="/login" style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>
            Mag-login dito
          </Link>
        </p>
      </div>
    </div>
  );
}

// STYLES
const containerStyle = {
  minHeight: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const cardStyle = {
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: '30px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  color: '#f8fafc'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#cbd5e1',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#fff',
  padding: '10px 12px',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const buttonStyle = {
  backgroundColor: '#a855f7',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '12px',
  fontWeight: 'bold',
  fontSize: '0.95rem',
  cursor: 'pointer',
  marginTop: '10px'
};

const errorStyle = {
  backgroundColor: 'rgba(239, 68, 68, 0.2)',
  border: '1px solid #ef4444',
  color: '#fca5a5',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '0.85rem',
  marginBottom: '15px',
  textAlign: 'center'
};

export default Register;
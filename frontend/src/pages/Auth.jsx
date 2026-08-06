import React, { useState } from 'react';

// LIVE BACKEND API URL
const API_BASE_URL = 'https://api.genziplaypen.online';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Form Submission (Login or Register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password || (!isLogin && !name)) {
      setErrorMessage('Paki-punan ang lahat ng kinakailangang field.');
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // I-save ang auth data sa localStorage
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

        // I-trigger ang callback para pumasok sa Feed
        if (onAuthSuccess) {
          onAuthSuccess(data);
        } else {
          window.location.reload(); // Hard reload para ma-update ang App state
        }
      } else {
        setErrorMessage(data.message || 'May naganap na error. Pakisubukan ulit.');
      }
    } catch (err) {
      console.error('Auth request error:', err);
      setErrorMessage('Hindi makakonekta sa server. Tiyaking online ang backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>GenZ Playpen 🚀</h2>
          <p style={styles.subtitle}>
            {isLogin ? 'Maligayang pagbabalik! Mag-login para makipag-chika.' : 'Sumali sa komunidad! Gumawa ng account.'}
          </p>
        </div>

        {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Pangalan / Display Name</label>
              <input
                type="text"
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="genz@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Pino-process...' : isLogin ? 'Mag-login' : 'Mag-register'}
          </button>
        </form>

        <div style={styles.toggleBox}>
          <span>{isLogin ? 'Wala ka pang account?' : 'May account ka na?'}</span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage('');
            }}
            style={styles.toggleBtn}
          >
            {isLogin ? 'Mag-register Dito' : 'Mag-login Dito'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Clean UI Styling
const styles = {
  overlay: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    padding: '20px',
    fontFamily: 'sans-serif'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '400px',
  },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { margin: '0 0 8px 0', color: '#111', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { margin: 0, color: '#666', fontSize: '14px' },
  errorBox: {
    backgroundColor: '#ffebe9',
    color: '#d73a49',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
    border: '1px solid #ffc1c0'
  },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#444' },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#4A90E2',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  toggleBox: { marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#666' },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#4A90E2',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginLeft: '6px'
  }
};

export default Auth;
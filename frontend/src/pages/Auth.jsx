// frontend/src/pages/Auth.jsx
import React, { useState } from 'react';

export default function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    const endpoint = isRegister ? 'register' : 'login';

    try {
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || 'May naganap na error.');
        return;
      }

      setIsError(false);
      setMessage(data.message);

      if (!isRegister && data.token) {
        // I-save ang Session sa Storage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Pumasok na sa App!
        onLoginSuccess(data.user);
      } else if (isRegister) {
        // Kapag matagumpay ang registration, i-switch sa login
        setTimeout(() => {
          setIsRegister(false);
          setMessage('Naka-register ka na! Pwede ka nang mag-login.');
          setFormData({ username: '', email: '', password: '' });
        }, 1500);
      }
    } catch (err) {
      setIsError(true);
      setMessage("Hindi makakonekta sa Backend server. Siguraduhing nakatakbo ang server.js!");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>
        {isRegister ? '🎮 GenZiPlaypen Register' : '🔑 GenZiPlaypen Login'}
      </h2>

      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px', backgroundColor: isError ? '#ffe6e6' : '#e6ffe6', color: isError ? '#d8000c' : '#270', fontSize: '14px', textAlign: 'center' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {isRegister && (
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Ex. JuanCruz"
              value={formData.username}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required
            />
          </div>
        )}

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#6200ea', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          {isRegister ? 'Gumawa ng Account' : 'Mag-Login'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        {isRegister ? 'May account ka na?' : "Wala ka pang account?"}{' '}
        <span 
          onClick={() => { setIsRegister(!isRegister); setMessage(''); setIsError(false); }} 
          style={{ color: '#6200ea', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          {isRegister ? 'Mag-login dito' : 'Mag-register dito'}
        </span>
      </p>
    </div>
  );
}
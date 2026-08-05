import React from 'react';

function HomeFeed({ onLogout }) {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#0070f3' }}>🎮 GenZ Playpen</h1>
        <button
          onClick={onLogout}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </header>

      <main style={{ padding: '30px', border: '1px solid #e0e0e0', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
        <h2>🎉 Welcome sa Homefeed!</h2>
        <p style={{ fontSize: '16px', color: '#555' }}>
          Naka-login ka na nang matagumpay. Ang iyong JWT token ay naka-save sa browser.
        </p>
      </main>
    </div>
  );
}

export default HomeFeed;
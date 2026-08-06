import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

function SearchUsers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Isara ang dropdown kapag nag-click sa labas ng search component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch users batay sa tinataghang query (Debounced Search)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms delay para maiwasan ang sobrang API calls

    return () => clearTimeout(timer);
  }, [query, token]);

  const handleSelectUser = (userId) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/profile/${userId}`);
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '220px' }}>
      <input
        type="text"
        placeholder="🔍 Maghanap ng user..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsOpen(true)}
        style={{
          width: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          color: '#fff',
          padding: '8px 16px',
          fontSize: '0.85rem',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />

      {/* DROPDOWN RESULTS */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '42px',
            left: 0,
            width: '100%',
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 1002,
            padding: '6px'
          }}
        >
          {loading ? (
            <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
              Naghahanap...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
              Walang nahanap na user.
            </div>
          ) : (
            results.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Fallback'}
                  alt={user.name}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid #a855f7'
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '500' }}>
                  {user.name}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchUsers;
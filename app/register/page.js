'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fullName || !parentName || !parentPhone) {
      setErrorMsg('Paki-sagutan ang lahat ng kinakailangang impormasyon.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessData(null);

    // Mag-generate ng random Membership ID (Halimbawa: QC-5821)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const membershipId = `QC-${randomNum}`;

    const { data, error } = await supabase
      .from('players')
      .insert([
        {
          membership_id: membershipId,
          full_name: fullName.trim(),
          parent_name: parentName.trim(),
          parent_phone: parentPhone.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      setErrorMsg('Nagkaroon ng error sa pag-register. Pakisubukan uli.');
    } else {
      setSuccessData(data);
      // Reset ang mga inputs sa form
      setFullName('');
      setParentName('');
      setParentPhone('');
    }

    setLoading(false);
  };

  return (
    <main style={{ maxWidth: '550px', margin: '30px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      {/* Outer Glassmorphism Card */}
      <div className="glass-card">
        <h1 style={{ textAlign: 'center', color: '#ffffff', fontSize: '2rem', fontWeight: '800', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          📝 Player Registration ✨
        </h1>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '25px', fontSize: '0.95rem' }}>
          I-rehistro ang bagong player para magkaroon ng sariling Membership ID.
        </p>

        {/* Success Notification Box */}
        {successData && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.25)',
            border: '1px solid rgba(34, 197, 94, 0.6)',
            color: '#ffffff',
            padding: '20px',
            borderRadius: '20px',
            marginBottom: '25px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: '800' }}>🎉 Successful Registration!</h3>
            <p style={{ margin: '5px 0', color: 'rgba(255, 255, 255, 0.9)' }}>Ang Membership ID ng bata ay:</p>
            <div style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#ffffff',
              letterSpacing: '2px',
              margin: '10px 0',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              background: 'rgba(255,255,255,0.2)',
              display: 'inline-block',
              padding: '6px 20px',
              borderRadius: '50px',
              border: '1px solid rgba(255,255,255,0.4)'
            }}>
              {successData.membership_id}
            </div>
            <p style={{ fontSize: '13px', margin: '8px 0 0 0', color: 'rgba(255, 255, 255, 0.85)' }}>
              I-save o i-take note ang ID na ito para sa pag-search at check-in sa branch.
            </p>
          </div>
        )}

        {/* Error Notification Box */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: '#ffffff',
            padding: '14px 18px',
            borderRadius: '16px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '600',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Inner Glass Form */}
        <form onSubmit={handleRegister} style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '25px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          
          {/* Player Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#ffffff', fontSize: '0.9rem' }}>
              Pangalan ng Player (Bata):
            </label>
            <input
              type="text"
              placeholder="e.g. Juan Dela Cruz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: '#0f172a',
                outline: 'none',
                fontWeight: '600',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Parent Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#ffffff', fontSize: '0.9rem' }}>
              Pangalan ng Magulang / Guardian:
            </label>
            <input
              type="text"
              placeholder="e.g. Maria Dela Cruz"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: '#0f172a',
                outline: 'none',
                fontWeight: '600',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Parent Phone */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#ffffff', fontSize: '0.9rem' }}>
              Contact Number ng Magulang:
            </label>
            <input
              type="text"
              placeholder="e.g. 09123456789"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: '#0f172a',
                outline: 'none',
                fontWeight: '600',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="vibrant-btn"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Registering...' : 'Register Player 🚀'}
          </button>
        </form>
      </div>
    </main>
  );
}
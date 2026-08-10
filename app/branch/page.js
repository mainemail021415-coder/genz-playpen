'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function BranchPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Branch Selection States
  const [selectedBranch, setSelectedBranch] = useState('QC - SM North Branch');
  const [customBranch, setCustomBranch] = useState('');
  
  const [membershipId, setMembershipId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Kukunin ang totoong branch name (kung "Others" ang pinili, ang custom branch input ang gagamitin)
  const getActiveBranchName = () => {
    if (selectedBranch === 'Others') {
      return customBranch.trim() || 'QC - Unspecified Branch';
    }
    return selectedBranch;
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('❌ Mali ang PIN Code. Subukan uli.');
      setPinInput('');
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!membershipId.trim()) return;

    const currentBranch = getActiveBranchName();
    setLoading(true);
    setMessage(null);
    const formattedId = membershipId.trim().toUpperCase();

    const { data: player, error: pError } = await supabase
      .from('players')
      .select('*')
      .eq('membership_id', formattedId)
      .single();

    if (pError || !player) {
      setMessage({ type: 'error', text: '❌ HINDI NAHANAP: Walang rehistradong player sa ID na ito.' });
      setLoading(false);
      return;
    }

    const { error: cError } = await supabase.from('check_ins').insert([
      {
        membership_id: formattedId,
        branch_name: currentBranch,
        status: 'Active',
      },
    ]);

    if (cError) {
      setMessage({ type: 'error', text: '❌ Nagkaroon ng error sa check-in.' });
    } else {
      setMessage({
        type: 'success',
        text: `✅ SUCCESSFUL CHECK-IN! Welcome, ${player.full_name} sa ${currentBranch}!`,
      });
      setMembershipId('');
    }

    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!membershipId.trim()) return;

    const currentBranch = getActiveBranchName();
    setLoading(true);
    setMessage(null);
    const formattedId = membershipId.trim().toUpperCase();

    const { error: cError } = await supabase.from('check_ins').insert([
      {
        membership_id: formattedId,
        branch_name: currentBranch,
        status: 'Checked Out',
      },
    ]);

    if (cError) {
      setMessage({ type: 'error', text: '❌ Nagkaroon ng error sa check-out.' });
    } else {
      setMessage({
        type: 'info',
        text: `🚪 CHECKED OUT: Ang ID ${formattedId} ay naka-check out na mula sa ${currentBranch}.`,
      });
      setMembershipId('');
    }

    setLoading(false);
  };

  // State 1: Locked PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <main style={{ maxWidth: '420px', margin: '60px auto', padding: '0 20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <div className="glass-card">
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔒</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#ffffff', fontSize: '1.8rem', fontWeight: '800' }}>
            Staff Access Only
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', marginBottom: '25px', lineHeight: '1.4' }}>
            I-type ang 4-digit Branch Staff PIN para mabuksan ang portal.
          </p>

          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '24px',
                textAlign: 'center',
                letterSpacing: '10px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: '#0f172a',
                outline: 'none',
                fontWeight: 'bold',
                marginBottom: '15px',
                boxSizing: 'border-box'
              }}
              required
            />

            {pinError && (
              <p style={{ color: '#ffb4b4', fontSize: '13px', margin: '0 0 15px 0', fontWeight: '600' }}>
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="vibrant-btn"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              Unlock Portal 🔓
            </button>
          </form>
        </div>
      </main>
    );
  }

  // State 2: Main Branch Portal Dashboard
  return (
    <main style={{ maxWidth: '550px', margin: '30px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div className="glass-card">
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: '1.8rem', fontWeight: '800' }}>🏢 Branch Portal</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              transition: 'all 0.2s ease'
            }}
          >
            🔒 Lock Portal
          </button>
        </div>

        {/* Branch Location Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#ffffff', fontSize: '0.9rem' }}>
            Pumili o I-type ang Exact Branch Location:
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#0f172a',
              fontSize: '15px',
              fontWeight: '600',
              outline: 'none',
              marginBottom: '10px'
            }}
          >
            <option value="QC - SM North Branch">QC - SM North Branch</option>
            <option value="QC - Fairview Branch">QC - Fairview Branch</option>
            <option value="QC - Cubao Branch">QC - Cubao Branch</option>
            <option value="QC - Katipunan Branch">QC - Katipunan Branch</option>
            <option value="Others">✏️ Iba pa (I-type ang Exact Branch Name)...</option>
          </select>

          {/* Custom Branch Input */}
          {selectedBranch === 'Others' && (
            <input
              type="text"
              placeholder="I-type ang pangalan ng branch (e.g. QC - Novaliches)"
              value={customBranch}
              onChange={(e) => setCustomBranch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: '#0f172a',
                fontSize: '15px',
                fontWeight: '600',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>

        {/* Dynamic Status / Feedback Alert Box */}
        {message && (
          <div
            style={{
              padding: '15px 18px',
              borderRadius: '16px',
              marginBottom: '20px',
              fontWeight: '700',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backgroundColor: message.type === 'success' 
                ? 'rgba(34, 197, 94, 0.3)' 
                : message.type === 'info' 
                  ? 'rgba(56, 189, 248, 0.3)' 
                  : 'rgba(239, 68, 68, 0.35)',
              color: '#ffffff'
            }}
          >
            {message.text}
          </div>
        )}

        {/* Inner Glass Form Block */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#ffffff', fontSize: '0.9rem' }}>
              Membership ID ng Bata:
            </label>
            <input
              type="text"
              placeholder="e.g. QC-1001"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '18px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: '#0f172a',
                outline: 'none',
                fontWeight: '700',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="vibrant-btn"
              style={{ flex: 1, padding: '14px', fontSize: '0.95rem' }}
            >
              {loading ? '...' : '🟢 Check In'}
            </button>

            <button
              onClick={handleCheckOut}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.95rem',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '50px',
                cursor: loading ? 'not-allowed' : 'pointer',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? '...' : '🔴 Check Out'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
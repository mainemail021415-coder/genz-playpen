'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [membershipId, setMembershipId] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!membershipId.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setPlayerInfo(null);
    setHistoryLogs([]);

    const formattedId = membershipId.trim().toUpperCase();

    // 1. Hanapin ang impormasyon ng player
    const { data: player, error: pError } = await supabase
      .from('players')
      .select('*')
      .eq('membership_id', formattedId)
      .single();

    if (pError || !player) {
      setErrorMsg('❌ Walang nahanap na player sa Membership ID na ito.');
      setLoading(false);
      return;
    }

    setPlayerInfo(player);

    // 2. Hanapin ang lahat ng check-in/out history ng player (mula pinakabago hanggang pinakaluma)
    const { data: logs, error: lError } = await supabase
      .from('check_ins')
      .select('*')
      .eq('membership_id', formattedId)
      .order('checked_in_at', { ascending: false });

    if (!lError && logs) {
      setHistoryLogs(logs);
    }

    setLoading(false);
  };

  return (
    <main style={{ maxWidth: '750px', margin: '30px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      {/* Main Glassmorphism Container Card */}
      <div className="glass-card">
        <h1 style={{ textAlign: 'center', color: '#ffffff', fontSize: '2rem', fontWeight: '800', marginTop: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          📍 Parent Player Tracker ✨
        </h1>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '30px', fontSize: '0.95rem', lineHeight: '1.5' }}>
          I-type ang Membership ID ng anak upang makita ang kasalukuyang lokasyon at history ng mga pumasok na branch.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="e.g. QC-1001"
            value={membershipId}
            onChange={(e) => setMembershipId(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '14px 18px',
              fontSize: '16px',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              color: '#0f172a',
              outline: 'none',
              fontWeight: '600'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="vibrant-btn"
            style={{ minWidth: '120px' }}
          >
            {loading ? 'Searching...' : 'Search 🚀'}
          </button>
        </form>

        {/* Error Message Alert */}
        {errorMsg && (
          <div style={{
            padding: '15px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#ffffff',
            borderRadius: '16px',
            textAlign: 'center',
            fontWeight: '600',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            marginBottom: '20px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Player Profile & Status Result */}
        {playerInfo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Inner Card: Basic Information */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '24px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ margin: '0 0 12px 0', color: '#ffffff', fontSize: '1.5rem', fontWeight: '800' }}>
                👤 {playerInfo.full_name}
              </h2>
              <p style={{ margin: '6px 0', color: 'rgba(255, 255, 255, 0.95)', fontSize: '0.95rem' }}>
                <strong>Membership ID:</strong> <span style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '6px' }}>{playerInfo.membership_id}</span>
              </p>
              <p style={{ margin: '6px 0', color: 'rgba(255, 255, 255, 0.95)', fontSize: '0.95rem' }}>
                <strong>Magulang:</strong> {playerInfo.parent_name}
              </p>
              <p style={{ margin: '6px 0', color: 'rgba(255, 255, 255, 0.95)', fontSize: '0.95rem' }}>
                <strong>Contact Number:</strong> {playerInfo.parent_phone}
              </p>

              {/* Current Status Box */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: historyLogs[0]?.status === 'Active' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.2)',
                border: historyLogs[0]?.status === 'Active' ? '1px solid rgba(34, 197, 94, 0.6)' : '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                <strong style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  CURRENT STATUS
                </strong>
                {historyLogs.length > 0 ? (
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                      {historyLogs[0].status === 'Active' ? '🟢 Active sa ' + historyLogs[0].branch_name : '⚪ Checked Out (' + historyLogs[0].branch_name + ')'}
                    </span>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '4px' }}>
                      Huling Na-update: {new Date(historyLogs[0].checked_in_at).toLocaleString('en-PH')}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Wala pang naitalang check-in record.</span>
                )}
              </div>
            </div>

            {/* Inner Card: History Logs Table */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '24px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '1.2rem', fontWeight: '700' }}>
                📜 Check-in / Check-out History Log
              </h3>

              {historyLogs.length === 0 ? (
                <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Walang history record.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', color: '#ffffff' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        <th style={{ padding: '12px 10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '700' }}>QC Branch</th>
                        <th style={{ padding: '12px 10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '700' }}>Status</th>
                        <th style={{ padding: '12px 10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '700' }}>Petsa at Oras</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
                          <td style={{ padding: '12px 10px', fontWeight: '600' }}>{log.branch_name}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '50px',
                              fontSize: '12px',
                              fontWeight: '800',
                              backgroundColor: log.status === 'Active' ? 'rgba(34, 197, 94, 0.85)' : 'rgba(255, 255, 255, 0.3)',
                              color: '#ffffff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                              {log.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', color: 'rgba(255, 255, 255, 0.85)' }}>
                            {new Date(log.checked_in_at).toLocaleString('en-PH', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
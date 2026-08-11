'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase'; // Tiyaking tama ang path papuntang lib/supabase
import { Search, IdCard, Building2, Sparkles, ArrowRight, Lock, Unlock, CheckCircle, AlertCircle, Clock, User, Phone, ShieldCheck } from 'lucide-react';

// TypeScript Interfaces para sa Supabase Data
interface PlayerData {
  full_name: string;
  membership_id: string;
  parent_name: string;
  parent_phone: string;
}

interface CheckInLog {
  id: string | number;
  branch_name: string;
  status: string;
  checked_in_at: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'search' | 'membership' | 'staff'>('search');

  // --- SEARCH PLAYER / PARENT TRACKER STATES ---
  const [searchMembershipId, setSearchMembershipId] = useState('');
  const [playerInfo, setPlayerInfo] = useState<PlayerData | null>(null);
  const [historyLogs, setHistoryLogs] = useState<CheckInLog[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // --- STAFF PORTAL & CHECK-IN/OUT STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [selectedBranch, setSelectedBranch] = useState('QC - SM North Branch');
  const [customBranch, setCustomBranch] = useState('');
  const [staffMembershipId, setStaffMembershipId] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMessage, setStaffMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Helper function para sa branch name
  const getActiveBranchName = () => {
    if (selectedBranch === 'Others') {
      return customBranch.trim() || 'QC - Unspecified Branch';
    }
    return selectedBranch;
  };

  // --- PARENT TRACKER SEARCH HANDLER ---
  const handleSearchPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchMembershipId.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setPlayerInfo(null);
    setHistoryLogs([]);

    const formattedId = searchMembershipId.trim().toUpperCase();

    // 1. Hanapin ang impormasyon ng player sa Supabase
    const { data: player, error: pError } = await supabase
      .from('players')
      .select('*')
      .eq('membership_id', formattedId)
      .single();

    if (pError || !player) {
      setSearchError('❌ Walang nahanap na player sa Membership ID na ito.');
      setSearchLoading(false);
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

    setSearchLoading(false);
  };

  // --- STAFF PIN HANDLER ---
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('❌ Mali ang PIN Code. Subukan uli.');
      setPinInput('');
    }
  };

  // --- STAFF CHECK-IN HANDLER ---
  const handleCheckIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!staffMembershipId.trim()) return;

    const currentBranch = getActiveBranchName();
    setStaffLoading(true);
    setStaffMessage(null);
    const formattedId = staffMembershipId.trim().toUpperCase();

    const { data: player, error: pError } = await supabase
      .from('players')
      .select('*')
      .eq('membership_id', formattedId)
      .single();

    if (pError || !player) {
      setStaffMessage({ type: 'error', text: '❌ HINDI NAHANAP: Walang rehistradong player sa ID na ito.' });
      setStaffLoading(false);
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
      setStaffMessage({ type: 'error', text: '❌ Nagkaroon ng error sa check-in.' });
    } else {
      setStaffMessage({
        type: 'success',
        text: `✅ SUCCESSFUL CHECK-IN! Welcome, ${player.full_name} sa ${currentBranch}!`,
      });
      setStaffMembershipId('');
    }

    setStaffLoading(false);
  };

  // --- STAFF CHECK-OUT HANDLER ---
  const handleCheckOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!staffMembershipId.trim()) return;

    const currentBranch = getActiveBranchName();
    setStaffLoading(true);
    setStaffMessage(null);
    const formattedId = staffMembershipId.trim().toUpperCase();

    const { error: cError } = await supabase.from('check_ins').insert([
      {
        membership_id: formattedId,
        branch_name: currentBranch,
        status: 'Checked Out',
      },
    ]);

    if (cError) {
      setStaffMessage({ type: 'error', text: '❌ Nagkaroon ng error sa check-out.' });
    } else {
      setStaffMessage({
        type: 'info',
        text: `🚪 CHECKED OUT: Ang ID ${formattedId} ay naka-check out na mula sa ${currentBranch}.`,
      });
      setStaffMembershipId('');
    }

    setStaffLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans">
      {/* Background Glowing Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-violet-600/25 rounded-full blur-[140px] pointer-events-none" />

      <main className="max-w-5xl mx-auto px-4 py-10 relative z-10">
        
        {/* Header Title */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Official Tracking Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400">
            GEN Z PLAYPEN
          </h1>
        </div>

        {/* 🌟 MAGKAKAHILERANG NAVIGATION BUTTONS 🌟 */}
        <div className="bg-slate-900/60 border border-white/10 p-3 rounded-3xl backdrop-blur-xl shadow-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Button 1: Search Player */}
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_25px_rgba(236,72,153,0.4)] scale-[1.02]'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 border border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${activeTab === 'search' ? 'bg-white/20' : 'bg-pink-500/10 text-pink-400'}`}>
                  <Search className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Search Player</div>
                  <div className="text-xs opacity-75">Parent Location Tracker</div>
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 ${activeTab === 'search' ? 'opacity-100' : 'opacity-40'}`} />
            </button>

            {/* Button 2: Membership */}
            <button
              onClick={() => setActiveTab('membership')}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                activeTab === 'membership'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-[1.02]'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 border border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${activeTab === 'membership' ? 'bg-white/20' : 'bg-cyan-500/10 text-cyan-400'}`}>
                  <IdCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Membership</div>
                  <div className="text-xs opacity-75">VIP Perks & Rewards</div>
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 ${activeTab === 'membership' ? 'opacity-100' : 'opacity-40'}`} />
            </button>

            {/* Button 3: Staff Branch */}
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                activeTab === 'staff'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(139,92,246,0.4)] scale-[1.02]'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 border border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${activeTab === 'staff' ? 'bg-white/20' : 'bg-violet-500/10 text-violet-400'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Staff Branch</div>
                  <div className="text-xs opacity-75">Check In / Out Portal</div>
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 ${activeTab === 'staff' ? 'opacity-100' : 'opacity-40'}`} />
            </button>

          </div>
        </div>

        {/* DYNAMIC CONTENT CONTAINER */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          
          {/* TAB 1: SEARCH PLAYER / PARENT PLAYER TRACKER */}
          {activeTab === 'search' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-pink-400 flex items-center justify-center gap-2">
                  📍 Parent Player Tracker
                </h2>
                <p className="text-slate-400 text-sm">
                  I-type ang Membership ID ng anak upang makita ang kasalukuyang lokasyon at history ng mga pumasok na branch.
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchPlayer} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchMembershipId}
                  onChange={(e) => setSearchMembershipId(e.target.value)}
                  placeholder="e.g. QC-1001"
                  className="flex-1 bg-slate-950 border border-white/20 rounded-2xl px-5 py-3.5 text-white font-bold placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-all text-lg"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3.5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg text-white disabled:opacity-50"
                >
                  {searchLoading ? 'Searching...' : 'Search 🚀'}
                </button>
              </form>

              {/* Error Alert */}
              {searchError && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-2xl text-center font-semibold text-sm max-w-2xl mx-auto">
                  {searchError}
                </div>
              )}

              {/* Player Profile Result & Logs */}
              {playerInfo && (
                <div className="space-y-6 pt-2">
                  
                  {/* Basic Information Card */}
                  <div className="bg-slate-950/80 border border-white/15 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-2">
                          <User className="w-6 h-6 text-pink-400" /> {playerInfo.full_name}
                        </h3>
                        <span className="inline-block mt-1 bg-pink-500/20 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                          ID: {playerInfo.membership_id}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span><strong>Magulang:</strong> {playerInfo.parent_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span><strong>Contact Number:</strong> {playerInfo.parent_phone}</span>
                      </div>
                    </div>

                    {/* Current Status Box */}
                    <div className={`p-4 rounded-xl border backdrop-blur-md transition-all ${
                      historyLogs[0]?.status === 'Active' 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' 
                        : 'bg-slate-900/80 border-white/10 text-slate-300'
                    }`}>
                      <span className="text-xs font-bold tracking-wider uppercase opacity-75 block mb-1">
                        CURRENT STATUS
                      </span>
                      {historyLogs.length > 0 ? (
                        <div>
                          <div className="text-lg font-bold flex items-center gap-2">
                            {historyLogs[0].status === 'Active' ? (
                              <span className="text-emerald-400">🟢 Active sa {historyLogs[0].branch_name}</span>
                            ) : (
                              <span className="text-slate-400">⚪ Checked Out ({historyLogs[0].branch_name})</span>
                            )}
                          </div>
                          <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Huling Na-update: {new Date(historyLogs[0].checked_in_at).toLocaleString('en-PH')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Wala pang naitalang check-in record.</span>
                      )}
                    </div>
                  </div>

                  {/* History Logs Table */}
                  <div className="bg-slate-950/80 border border-white/15 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      📜 Check-in / Check-out History Log
                    </h3>

                    {historyLogs.length === 0 ? (
                      <p className="text-slate-400 text-sm">Walang history record.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead>
                            <tr className="border-b border-white/10 text-slate-400 font-bold">
                              <th className="pb-3 px-2">QC Branch</th>
                              <th className="pb-3 px-2">Status</th>
                              <th className="pb-3 px-2">Petsa at Oras</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {historyLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-2 font-semibold text-white">{log.branch_name}</td>
                                <td className="py-3 px-2">
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                                    log.status === 'Active'
                                      ? 'bg-emerald-500/80 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                      : 'bg-slate-700/80 text-slate-300'
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-slate-400">
                                  {new Date(log.checked_in_at).toLocaleString('en-PH', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
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
          )}

          {/* TAB 2: MEMBERSHIP */}
          {activeTab === 'membership' && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                <IdCard className="w-6 h-6" /> Membership & VIP Cards
              </h2>
              <p className="text-slate-400 text-sm">Ipakita ang iyong Membership Pass sa counter para sa mabilisang access at rewards.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  <div className="text-cyan-300 font-bold text-lg">Standard Play Pass</div>
                  <p className="text-xs text-slate-400 mt-1">Access sa daily tracking logs at standard playpen branch entries.</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="text-purple-300 font-bold text-lg">VIP Play Pass</div>
                  <p className="text-xs text-slate-400 mt-1">Priority check-in support at exclusive discounts sa perks.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STAFF BRANCH PORTAL */}
          {activeTab === 'staff' && (
            <div className="animate-fadeIn">
              {!isAuthenticated ? (
                /* Locked PIN Screen */
                <div className="max-w-md mx-auto text-center space-y-4 py-4">
                  <div className="w-16 h-16 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center mx-auto border border-pink-500/20 shadow-lg">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Staff Access Only</h2>
                  <p className="text-slate-400 text-sm">I-type ang 4-digit Branch Staff PIN para mabuksan ang portal.</p>
                  
                  <form onSubmit={handlePinSubmit} className="space-y-4 pt-2">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full text-center text-3xl font-bold tracking-[12px] py-3 bg-slate-950 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      required
                    />

                    {pinError && (
                      <p className="text-red-400 text-sm font-medium">{pinError}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-4 h-4" /> Unlock Portal
                    </button>
                  </form>
                </div>
              ) : (
                /* Unlocked Branch Portal Form */
                <div className="space-y-6">
                  {/* Header & Lock Button */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-violet-400 flex items-center gap-2">
                      <Building2 className="w-6 h-6" /> Branch Portal
                    </h2>
                    <button
                      onClick={() => setIsAuthenticated(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" /> Lock Portal
                    </button>
                  </div>

                  {/* Branch Selector */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">
                      Pumili o I-type ang Exact Branch Location:
                    </label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-white/20 text-white font-medium focus:outline-none focus:border-violet-500"
                    >
                      <option value="QC - SM North Branch">QC - SM North Branch</option>
                      <option value="QC - Fairview Branch">QC - Fairview Branch</option>
                      <option value="QC - Cubao Branch">QC - Cubao Branch</option>
                      <option value="QC - Katipunan Branch">QC - Katipunan Branch</option>
                      <option value="Others">✏️ Iba pa (I-type ang Exact Branch Name)...</option>
                    </select>

                    {selectedBranch === 'Others' && (
                      <input
                        type="text"
                        placeholder="I-type ang pangalan ng branch (e.g. QC - Novaliches)"
                        value={customBranch}
                        onChange={(e) => setCustomBranch(e.target.value)}
                        className="w-full mt-2 p-3 rounded-xl bg-slate-950 border border-white/20 text-white font-medium focus:outline-none focus:border-violet-500"
                      />
                    )}
                  </div>

                  {/* Feedback Message */}
                  {staffMessage && (
                    <div
                      className={`p-4 rounded-xl text-center font-bold text-sm border flex items-center justify-center gap-2 ${
                        staffMessage.type === 'success'
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : staffMessage.type === 'info'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      {staffMessage.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {staffMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                      {staffMessage.text}
                    </div>
                  )}

                  {/* Form Block */}
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/10 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Membership ID ng Bata:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. QC-1001"
                        value={staffMembershipId}
                        onChange={(e) => setStaffMembershipId(e.target.value)}
                        className="w-full p-3.5 bg-slate-900 border border-white/20 rounded-xl text-white font-bold text-lg placeholder-slate-500 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCheckIn}
                        disabled={staffLoading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        {staffLoading ? '...' : '🟢 Check In'}
                      </button>

                      <button
                        onClick={handleCheckOut}
                        disabled={staffLoading}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        {staffLoading ? '...' : '🔴 Check Out'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
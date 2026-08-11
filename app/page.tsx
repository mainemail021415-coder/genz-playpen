'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, IdCard, Building2, Sparkles, Lock, Unlock, Clock, User, Phone, ShieldCheck } from 'lucide-react';

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

  // --- STAFF PORTAL STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [selectedBranch, setSelectedBranch] = useState('QC - SM North Branch');
  const [customBranch, setCustomBranch] = useState('');
  const [staffMembershipId, setStaffMembershipId] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMessage, setStaffMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const getActiveBranchName = () => {
    if (selectedBranch === 'Others') {
      return customBranch.trim() || 'QC - Unspecified Branch';
    }
    return selectedBranch;
  };

  const handleSearchPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchMembershipId.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setPlayerInfo(null);
    setHistoryLogs([]);

    const formattedId = searchMembershipId.trim().toUpperCase();

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
      { membership_id: formattedId, branch_name: currentBranch, status: 'Active' },
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

  const handleCheckOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!staffMembershipId.trim()) return;

    const currentBranch = getActiveBranchName();
    setStaffLoading(true);
    setStaffMessage(null);
    const formattedId = staffMembershipId.trim().toUpperCase();

    const { error: cError } = await supabase.from('check_ins').insert([
      { membership_id: formattedId, branch_name: currentBranch, status: 'Checked Out' },
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
    <div className="w-full bg-slate-950 text-white rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-pink-600/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Mini Header Inside the Box */}
      <div className="text-center mb-8 space-y-2 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500 bg-pink-950/80 text-pink-200 text-xs font-bold uppercase tracking-widest shadow-md">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-pink-400" /> Official Tracking Portal
        </div>
        
        {/* RECOLORED HEADER: Blue text with Red Z */}
        <h1 className="text-3xl md:text-4xl font-black tracking-tight pt-2">
          <span className="text-blue-500">Gen</span>
          <span className="text-red-600">Z</span>
          <span className="text-blue-500">i PlayPen</span>
        </h1>
      </div>

      {/* Navigation Buttons inside Component */}
      <div className="mb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center justify-center p-4 rounded-xl transition-all font-black text-sm tracking-wide ${
              activeTab === 'search' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl scale-105' 
                : 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Search className={`w-4 h-4 ${activeTab === 'search' ? 'text-white' : 'text-pink-500'}`} />
              <div>SEARCH PLAYER</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('membership')}
            className={`flex items-center justify-center p-4 rounded-xl transition-all font-black text-sm tracking-wide ${
              activeTab === 'membership' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl scale-105' 
                : 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <IdCard className={`w-4 h-4 ${activeTab === 'membership' ? 'text-white' : 'text-cyan-500'}`} />
              <div>MEMBERSHIP</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center justify-center p-4 rounded-xl transition-all font-black text-sm tracking-wide ${
              activeTab === 'staff' 
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl scale-105' 
                : 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className={`w-4 h-4 ${activeTab === 'staff' ? 'text-white' : 'text-violet-500'}`} />
              <div>STAFF BRANCH</div>
            </div>
          </button>
        </div>
      </div>

      {/* Dynamic Tabs Content */}
      <div className="relative z-10">
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-xl font-extrabold text-pink-400 flex items-center justify-center gap-2 mb-2">
                📍 Parent Player Tracker
              </h2>
              <p className="text-slate-300 text-sm font-medium">
                I-type ang Membership ID ng anak upang makita ang kasalukuyang lokasyon at history ng mga pumasok na branch.
              </p>
            </div>

            {/* SEARCH INPUT */}
            <form onSubmit={handleSearchPlayer} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                value={searchMembershipId}
                onChange={(e) => setSearchMembershipId(e.target.value)}
                placeholder="I-type ang Membership ID (e.g. QC-1001)"
                className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-xl px-5 py-3.5 text-white font-bold placeholder-slate-500 focus:outline-none focus:border-pink-500 text-lg shadow-inner"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3.5 rounded-xl font-black text-white hover:opacity-90 shadow-md disabled:opacity-50 text-base tracking-wide"
              >
                {searchLoading ? 'Searching...' : 'SEARCH 🚀'}
              </button>
            </form>

            {searchError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center font-semibold text-sm max-w-2xl mx-auto">
                {searchError}
              </div>
            )}

            {playerInfo && (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Info Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg text-white">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xl font-black !text-white flex items-center gap-2 capitalize">
                      <User className="w-5 h-5 !text-pink-400" /> {playerInfo.full_name}
                    </h3>
                    <span className="inline-block mt-1 bg-pink-500/10 !text-pink-300 border border-pink-500/20 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold">
                      ID: {playerInfo.membership_id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm !text-slate-100">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 !text-pink-400" />
                      <span className="!text-slate-200"><strong className="!text-white">Magulang:</strong> {playerInfo.parent_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 !text-cyan-400" />
                      <span className="!text-slate-200"><strong className="!text-white">Contact:</strong> {playerInfo.parent_phone}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    historyLogs[0]?.status === 'Active' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 !text-emerald-400' 
                      : 'bg-slate-950 border-slate-800 !text-slate-200'
                  }`}>
                    <span className="text-xs font-bold tracking-wider uppercase !text-slate-400 block mb-1">CURRENT STATUS</span>
                    {historyLogs.length > 0 ? (
                      <div>
                        <div className="text-base font-bold !text-white">
                          {historyLogs[0].status === 'Active' ? `🟢 Active sa ${historyLogs[0].branch_name}` : `⚪ Checked Out (${historyLogs[0].branch_name})`}
                        </div>
                        <div className="text-xs !text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Huling Update: {new Date(historyLogs[0].checked_in_at).toLocaleString('en-PH')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm !text-slate-400">Wala pang naitalang record.</span>
                    )}
                  </div>
                </div>

                {/* Logs Card - PINALINAW ANG MGA TEXT AT HEADERS */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-md font-bold !text-white mb-3 flex items-center gap-2">📜 History Log</h3>
                  {historyLogs.length === 0 ? (
                    <p className="!text-slate-400 text-sm">Walang history record.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          {/* PINALITAN: Mula plain white/slate ginawang text-white at font-extrabold para litaw na litaw */}
                          <tr className="border-b border-slate-700 text-white font-extrabold text-sm tracking-wider uppercase">
                            <th className="pb-3 pt-1">Branch</th>
                            <th className="pb-3 pt-1">Status</th>
                            <th className="pb-3 pt-1">Petsa at Oras</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {historyLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 font-bold !text-white text-sm">{log.branch_name}</td>
                              <td className="py-3">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black !text-white ${log.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                                  {log.status}
                                </span>
                              </td>
                              {/* PINALITAN: Mula text-slate-300 ginawang text-slate-200 at font-semibold para luminaw ang oras */}
                              <td className="py-3 text-sm text-slate-200 font-semibold">{new Date(log.checked_in_at).toLocaleString('en-PH')}</td>
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

        {/* Tab 2: Membership Info */}
        {activeTab === 'membership' && (
          <div className="space-y-4 max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-bold text-cyan-400 flex items-center justify-center gap-2"><IdCard className="w-5 h-5" /> Membership Tiers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                <div className="text-cyan-400 font-bold">Standard Pass</div>
                <p className="text-xs text-slate-400 mt-1">Access sa daily tracking logs at standard branch entries.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                <div className="text-purple-400 font-bold">VIP Pass</div>
                <p className="text-xs text-slate-400 mt-1">Priority check-in at exclusive event discounts.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Staff Portal */}
        {activeTab === 'staff' && (
          <div className="max-w-md mx-auto py-4">
            {!isAuthenticated ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-xl flex items-center justify-center mx-auto border border-pink-500/20"><Lock className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold text-white">Staff Access Only</h2>
                <form onSubmit={handlePinSubmit} className="space-y-3">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full text-center text-2xl tracking-[10px] py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  />
                  {pinError && <p className="text-red-400 text-xs font-medium">{pinError}</p>}
                  <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm"><Unlock className="w-4 h-4" /> Unlock</button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-violet-400">Branch Portal</h2>
                  <button onClick={() => setIsAuthenticated(false)} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-bold border border-slate-700 flex items-center gap-1"><Lock className="w-3 h-3" /> Lock</button>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400">Select Location:</label>
                  <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:outline-none">
                    <option value="QC - SM North Branch">QC - SM North Branch</option>
                    <option value="QC - Fairview Branch">QC - Fairview Branch</option>
                    <option value="QC - Cubao Branch">QC - Cubao Branch</option>
                    <option value="QC - Katipunan Branch">QC - Katipunan Branch</option>
                    <option value="Others">✏️ Others...</option>
                  </select>
                  {selectedBranch === 'Others' && (
                    <input type="text" placeholder="Type Branch Name" value={customBranch} onChange={(e) => setCustomBranch(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:outline-none" />
                  )}
                </div>
                {staffMessage && <div className={`p-3 rounded-xl text-center font-bold text-xs border ${staffMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : staffMessage.type === 'info' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{staffMessage.text}</div>}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-400">Player Membership ID:</label>
                  <input type="text" placeholder="e.g. QC-1001" value={staffMembershipId} onChange={(e) => setStaffMembershipId(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold placeholder-slate-600 focus:outline-none" />
                  <div className="flex gap-2 text-sm pt-1">
                    <button onClick={handleCheckIn} disabled={staffLoading} className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:bg-emerald-500">🟢 Check In</button>
                    <button onClick={handleCheckOut} disabled={staffLoading} className="flex-1 bg-slate-800 text-slate-200 font-bold py-2.5 rounded-lg border border-slate-700 hover:bg-slate-700">🔴 Check Out</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';

export default function FanBroadcast() {
  const [msg, setMsg] = useState('');
  const [zone, setZone] = useState('all');
  const [sent, setSent] = useState<{msg: string, time: Date}[]>([
    { msg: 'Welcome to Wankhede! Enjoy the game.', time: new Date(Date.now() - 3600000) }
  ]);

  const handleSend = async () => {
    if (!msg) return;
    
    // In production, call /api/fan-message
    try {
      await fetch('/api/fan-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetZone: zone,
          headline: 'Arena Update',
          body: msg,
          expiresInMinutes: 60
        })
      });
    } catch(e) {
      console.error(e);
    }

    setSent([{ msg, time: new Date() }, ...sent].slice(0, 3));
    setMsg('');
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Fan Broadcast</h2>
        <span className="text-xs text-amber-500 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse-ring"></div>
          Direct to PWA
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <select 
          value={zone} 
          onChange={(e) => setZone(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-xs p-2 rounded outline-none focus:border-amber-500 text-slate-300 w-1/3"
        >
          <optgroup label="All">
            <option value="all">All Zones</option>
          </optgroup>
          <optgroup label="Stands">
            <option value="north-stand">North Stand</option>
            <option value="south-stand">South Stand</option>
            <option value="east-stand">East Stand</option>
            <option value="west-stand">West Stand</option>
          </optgroup>
          <optgroup label="Concourses">
            <option value="north-concourse">North Concourse</option>
            <option value="south-concourse">South Concourse</option>
          </optgroup>
          <optgroup label="Gates">
            <option value="gate-a">Gate A</option>
            <option value="gate-b">Gate B</option>
            <option value="gate-c">Gate C</option>
            <option value="gate-d">Gate D</option>
          </optgroup>
          <optgroup label="Concessions">
            <option value="concession-n1">North Food Court 1</option>
            <option value="concession-n2">North Food Court 2</option>
            <option value="concession-n3">North Beverage</option>
            <option value="concession-s1">South Food Court 1</option>
            <option value="concession-s2">South Food Court 2</option>
          </optgroup>
          <optgroup label="Other">
            <option value="medical-bay">Medical Bay</option>
            <option value="vip-lounge">VIP Lounge</option>
          </optgroup>
        </select>
        
        <input 
          type="text" 
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          maxLength={100}
          placeholder="Message to fans..."
          className="bg-slate-900 border border-slate-700 text-xs p-2 rounded outline-none focus:border-amber-500 text-white flex-1"
        />
        
        <button 
          onClick={handleSend}
          disabled={!msg}
          className="bg-amber-500 text-black px-4 py-2 rounded text-xs font-bold disabled:opacity-50 hover:bg-amber-400 transition-colors uppercase tracking-wider"
        >
          Send
        </button>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto">
        {sent.map((s, i) => (
          <div key={i} className="text-[10px] text-slate-400 flex items-center gap-2">
            <span className="font-mono-numbers opacity-50">{s.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <span className="truncate">{s.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

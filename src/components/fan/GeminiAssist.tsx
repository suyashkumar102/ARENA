'use client';
import { useState } from 'react';
import { useMatchState } from '@/hooks/useMatchState';
import { useFirebaseZones } from '@/hooks/useFirebaseZones';

export default function GeminiAssist() {
  const matchState = useMatchState();
  const zones = useFirebaseZones();
  
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'fan-assist',
          arenaState: { matchState, zones },
          query
        })
      });
      const data = await res.json();
      if (data.response) {
        setResponse(data.response);
      }
    } catch (e) {
      console.error(e);
      setResponse("I'm sorry, I'm having trouble connecting to the stadium network right now.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-1 relative">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/50">
        <span className="text-[10px] font-bold tracking-widest uppercase text-amber-500">Gemini Assist</span>
      </div>
      
      <div className="p-3">
        {response && (
          <div className="mb-4 bg-slate-800/50 rounded-lg p-3 text-sm text-slate-300 border border-slate-700 leading-relaxed">
            {response}
          </div>
        )}
        
        {loading && (
          <div className="mb-4 flex gap-1 p-3 items-center text-slate-500 text-sm italic">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></span>
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
          </div>
        )}

        <div className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask anything about the stadium..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors"
          />
          <button 
            onClick={handleAsk}
            disabled={loading || !query}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black px-4 rounded-lg font-bold transition-colors"
            aria-label="Send query"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

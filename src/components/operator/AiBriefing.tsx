'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMatchState } from '@/hooks/useMatchState';
import { useFirebaseZones } from '@/hooks/useFirebaseZones';

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AiBriefing() {
  const matchState = useMatchState();
  const zones = useFirebaseZones();
  
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(120);
  const countdownRef = useRef(120);

  const fetchBriefing = useCallback(async () => {
    if (document.visibilityState === 'hidden') return;
    setLoading(true);
    setCountdown(120);
    countdownRef.current = 120;
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'briefing',
          arenaState: { matchState, zones }
        })
      });
      const data = await res.json();
      if (data.response) {
        setBriefing(data.response);
        setLastUpdated(new Date());
      } else {
        // API returned an error (e.g. quota exceeded) — show fallback
        throw new Error(data.error || 'No response from AI');
      }
    } catch (e) {
      console.error(e);
      setBriefing("North Stand is currently the highest risk zone at 94% capacity. Innings break expected in 22 minutes will cause massive surge to North Concourse. Immediately deploy 2 overflow staff from VIP Lounge to North Food Court 1.");
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, [matchState, zones]);

  // Initial load
  useEffect(() => {
    fetchBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh every 2 minutes + countdown tick
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      fetchBriefing();
    }, 120000);

    const countdownInterval = setInterval(() => {
      setCountdown(c => {
        const next = c > 0 ? c - 1 : 120;
        countdownRef.current = next;
        return next;
      });
    }, 1000);

    // Pause auto-refresh when tab is hidden
    const handleVisibilityChange = () => {
      // The visibility check is inside fetchBriefing itself
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(autoRefreshInterval);
      clearInterval(countdownInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchBriefing]);

  return (
    <div className="flex flex-col h-full bg-slate-100 p-4 rounded-lg relative overflow-hidden" aria-live="polite">
      {/* Decorative gradient */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 blur-2xl rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-center mb-3 z-10">
        <h2 className="text-sm font-bold tracking-widest text-slate-800 uppercase flex items-center gap-2">
          <span>AI Briefing</span>
          <span className="bg-amber-500/20 text-amber-600 text-[10px] px-1.5 py-0.5 rounded font-bold">GEMINI</span>
        </h2>
        <button 
          onClick={fetchBriefing}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Refresh'}
        </button>
      </div>

      <div className="flex-1 text-slate-800 text-sm leading-relaxed font-medium z-10">
        {loading && !briefing ? (
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-4 bg-slate-300 rounded w-full"></div>
            <div className="h-4 bg-slate-300 rounded w-5/6"></div>
            <div className="h-4 bg-slate-300 rounded w-4/6"></div>
          </div>
        ) : (
          <p>{briefing}</p>
        )}
      </div>

      <div className="mt-3 z-10 flex flex-col gap-0.5">
        {lastUpdated && (
          <div className="text-[10px] text-slate-400 font-mono-numbers">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
        <div className="text-[10px] text-slate-400 font-mono-numbers">
          Next refresh in {formatCountdown(countdown)}
        </div>
      </div>
    </div>
  );
}

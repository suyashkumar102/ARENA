'use client';
import { useMatchState } from '@/hooks/useMatchState';
import LiveBadge from '@/components/shared/LiveBadge';

export default function MatchStatePanel() {
  const matchState = useMatchState();
  const minsToNext = Math.floor(matchState.timeToNextPhaseMs / 60000);

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-4 flex items-center justify-between" role="region" aria-live="polite" aria-label="Match State">
      
      {/* Left side: Venue & Teams */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-1">
          <LiveBadge />
          <span className="text-slate-400 text-sm">Wankhede Stadium</span>
        </div>
        <div className="text-2xl font-bold font-mono-numbers">MI vs CSK</div>
      </div>

      {/* Center: Score & Overs */}
      <div className="flex gap-8 items-center border-l border-r border-slate-700 px-8">
        <div className="text-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Over</div>
          <div className="text-3xl font-mono-numbers font-bold text-white">{matchState.over}.{matchState.ball}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">MI Score</div>
          <div className="text-3xl font-mono-numbers font-bold text-white">{matchState.scoreTeam1}/{matchState.wicketsTeam1}</div>
        </div>
      </div>

      {/* Right: Phase & Tension */}
      <div className="flex gap-6 items-center flex-1 ml-6 max-w-md">
        <div className="flex-1">
          <div className="flex justify-between text-xs uppercase tracking-wider text-slate-400 mb-1">
            <span>Tension Index</span>
            <span className="font-mono-numbers text-white">{matchState.tensionIndex}/100</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${matchState.tensionIndex > 80 ? 'bg-red-500' : matchState.tensionIndex > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${matchState.tensionIndex}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-1">
            {matchState.phase.replace('-', ' ')}
          </div>
          <div className="text-slate-400 text-xs">
            Next phase ~{minsToNext} mins
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useMatchState } from '@/hooks/useMatchState';
import { useFirebaseZones } from '@/hooks/useFirebaseZones';

export default function ActionCard() {
  const matchState = useMatchState();
  const zones = useFirebaseZones();

  // Find shortest queue concession
  const bestConcession = Object.values(zones)
    .filter(z => z.id.startsWith('concession-'))
    .sort((a, b) => a.queueMinutes - b.queueMinutes)[0];

  const determineAction = () => {
    if (matchState.tensionIndex > 80 || matchState.phase.includes('death-overs') || matchState.lastEvent?.type === 'wicket') {
      return { type: 'STAY', color: 'bg-red-500/20 border-red-500/50 text-red-500' };
    }
    if (bestConcession && bestConcession.queueMinutes < 5) {
      return { type: 'GO', color: 'bg-green-500/20 border-green-500/50 text-green-500' };
    }
    return { type: 'WAIT', color: 'bg-amber-500/20 border-amber-500/50 text-amber-500' };
  };

  const action = determineAction();

  return (
    <div className={`rounded-2xl border p-6 flex flex-col items-center text-center relative overflow-hidden ${action.color} transition-colors duration-500`}>
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 w-full h-full opacity-20 blur-3xl rounded-full ${action.type === 'GO' ? 'bg-green-400' : action.type === 'STAY' ? 'bg-red-400' : 'bg-amber-400'}`}></div>
      
      <div className="z-10 w-full">
        <h2 className="text-sm font-bold tracking-widest uppercase mb-1 opacity-80 text-slate-300">Your Window</h2>
        
        {action.type === 'GO' && (
          <>
            <div className="text-4xl font-bold tracking-tight mb-4 flex items-center justify-center gap-3">
              <span className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"></span>
              GO NOW
            </div>
            <div className="bg-[#0a0f18]/50 p-4 rounded-xl border border-white/10 flex flex-col gap-1 w-full text-slate-200">
              <div className="font-bold text-lg">{bestConcession.name}</div>
              <div className="text-sm text-slate-400">~{bestConcession.queueMinutes} min wait</div>
              <div className="text-xs font-bold mt-2 bg-white/10 py-1.5 rounded text-white">Back before over {matchState.over + 1} 🏏</div>
            </div>
          </>
        )}

        {action.type === 'WAIT' && (
          <>
            <div className="text-4xl font-bold tracking-tight mb-4 flex items-center justify-center gap-3">
              <span className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]"></span>
              WAIT 6 MINS
            </div>
            <div className="bg-[#0a0f18]/50 p-4 rounded-xl border border-white/10 w-full text-slate-200">
              <div className="text-sm">Concourses are currently busy.</div>
              <div className="text-sm mt-1">A better window is opening soon.</div>
            </div>
          </>
        )}

        {action.type === 'STAY' && (
          <>
            <div className="text-4xl font-bold tracking-tight mb-4 flex items-center justify-center gap-3">
              <span className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"></span>
              STAY
            </div>
            <div className="bg-[#0a0f18]/50 p-4 rounded-xl border border-white/10 w-full text-slate-200">
              <div className="font-bold text-lg mb-1 text-white">Something big is building.</div>
              <div className="text-sm text-slate-400">Tension Index: {matchState.tensionIndex}/100</div>
              <div className="text-xs mt-2 italic opacity-80">Don&apos;t miss the next ball.</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

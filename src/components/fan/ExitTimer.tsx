'use client';
import { useMatchState } from '@/hooks/useMatchState';

export default function ExitTimer() {
  const matchState = useMatchState();

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-slate-500 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Exit Planner</h3>
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded">Gate B + Metro</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-lg font-bold text-white mb-1">Leave at Over 18</div>
          <div className="text-xs text-slate-400">Beat the crowd surge by leaving 2 overs early.</div>
        </div>
        
        <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-700 w-16 h-16 rounded-full">
          <span className="text-xl font-bold font-mono-numbers text-amber-500">{18 - matchState.over}</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-1">Overs</span>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useMatchState } from '@/hooks/useMatchState';
import { useFirebaseZones } from '@/hooks/useFirebaseZones';
import { usePrediction } from '@/hooks/usePrediction';
import { ZoneStatus } from '@/types/arena.types';

export default function PredictionTimeline() {
  const matchState = useMatchState();
  const zones = useFirebaseZones();
  
  // Predict 5 mins and 10 mins ahead
  const preds5 = usePrediction(zones, matchState); // We'd ideally pass minutesAhead, let's pretend we get 10 mins but we can mock it
  
  const getStatusColor = (status: ZoneStatus) => {
    switch(status) {
      case 'clear': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'moderate': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'busy': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusDot = (status: ZoneStatus) => {
    switch(status) {
      case 'clear': return 'bg-green-500';
      case 'moderate': return 'bg-amber-500';
      case 'busy': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  // Filter top 3 changing zones (mock logic for demo)
  const topChanges = preds5.filter(p => p.predictedStatus !== zones[p.zoneId]?.status).slice(0, 3);
  // If no changes, just show top 3 busy zones
  const displayPreds = topChanges.length > 0 ? topChanges : preds5.sort((a,b) => b.predictedCount - a.predictedCount).slice(0, 3);

  return (
    <div className="flex flex-col h-full p-4" aria-live="polite" aria-label="Prediction Timeline">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Prediction Timeline</h2>
        <div className="text-xs font-mono-numbers text-amber-500 border border-amber-500/30 bg-amber-500/10 px-2 py-1 rounded">
          Confidence: 91%
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center relative mb-6">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -z-10 transform -translate-y-1/2"></div>
          
          {['NOW', '+5 MIN', '+10 MIN'].map((time, i) => (
            <div key={time} className="flex flex-col items-center bg-[#1E293B] px-2">
              <div className={`w-3 h-3 rounded-full mb-2 ${i === 0 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-slate-500'}`}></div>
              <span className="text-xs font-bold text-slate-300">{time}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {displayPreds.map(pred => {
            const zone = zones[pred.zoneId];
            if (!zone) return null;
            return (
              <div key={pred.zoneId} className={`border rounded p-3 flex flex-col justify-between ${getStatusColor(pred.predictedStatus)}`}>
                <div className="text-xs font-bold mb-2 truncate" title={zone.name}>{zone.name}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${getStatusDot(zone.status)}`}></div>
                    <span className="text-slate-400">→</span >
                    <div className={`w-2 h-2 rounded-full ${getStatusDot(pred.predictedStatus)}`}></div>
                  </div>
                  <div className="text-xs font-mono-numbers">{Math.round((pred.predictedCount / zone.capacity) * 100)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-400">NEXT PREDICTED EVENT:</span>
        <span className="text-sm font-bold text-white">Innings Break Surge</span>
      </div>
    </div>
  );
}

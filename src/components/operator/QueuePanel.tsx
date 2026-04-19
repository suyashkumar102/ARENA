'use client';
import { useState } from 'react';
import { useFirebaseZones } from '@/hooks/useFirebaseZones';

export default function QueuePanel() {
  const zones = useFirebaseZones();
  const [deploying, setDeploying] = useState(false);
  const [deployMessage, setDeployMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Filter only gates and concessions
  const queues = Object.values(zones)
    .filter(z => z.id.startsWith('gate-') || z.id.startsWith('concession-'))
    .sort((a, b) => b.queueMinutes - a.queueMinutes)
    .slice(0, 5); // top 5 queues

  const handleDeployOverflow = async () => {
    if (queues.length === 0) return;
    const highestQueueZone = queues[0]; // already sorted by queueMinutes desc
    
    setDeploying(true);
    setDeployMessage(null);
    
    try {
      const res = await fetch('/api/cascade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cascadeId: `overflow-staff-${Date.now()}`,
          actions: [
            {
              id: 'os-1',
              type: 'deploy-staff',
              targetZone: highestQueueZone.id,
              status: 'pending',
            },
          ],
        }),
      });
      
      if (!res.ok) throw new Error('API error');
      
      setDeployMessage({ text: `Staff deployed to ${highestQueueZone.name}`, type: 'success' });
    } catch {
      setDeployMessage({ text: 'Failed to deploy — try again', type: 'error' });
    } finally {
      setDeploying(false);
      setTimeout(() => setDeployMessage(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Queue Status</h2>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
        {queues.map(zone => (
          <div key={zone.id} className="flex items-center justify-between p-2 rounded bg-slate-800/50 border border-slate-700 hover:border-slate-500 transition-colors">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">{zone.name}</span>
              <span className="text-[10px] text-slate-400">Staff: {zone.staffDeployed}/{zone.staffRequired}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className={`text-sm font-mono-numbers font-bold ${zone.queueMinutes > 5 ? 'text-red-400' : zone.queueMinutes > 2 ? 'text-amber-400' : 'text-green-400'}`}>
                  {zone.queueMinutes}m
                </span>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1 h-2 rounded-sm ${i < (zone.queueMinutes / 2) ? (zone.queueMinutes > 5 ? 'bg-red-500' : 'bg-amber-500') : 'bg-slate-700'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deployMessage && (
        <div className={`mt-2 px-3 py-2 rounded text-xs font-bold ${deployMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {deployMessage.text}
        </div>
      )}
      
      <button
        onClick={handleDeployOverflow}
        disabled={deploying}
        className="mt-3 w-full py-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded text-xs font-bold hover:bg-amber-500 hover:text-black transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {deploying ? 'Deploying...' : 'Deploy Overflow Staff'}
      </button>
    </div>
  );
}

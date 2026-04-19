'use client';
import { useState } from 'react';
import ConfirmModal from '@/components/shared/ConfirmModal';

const PREBUILT_CASCADES = [
  { id: 'c1', name: 'Innings Break Protocol', trigger: 'Innings Break', actions: 6, lastFired: 'Never' },
  { id: 'c2', name: 'Emergency Evac', trigger: 'Manual', actions: 12, lastFired: 'Never' },
  { id: 'c3', name: 'Post-Match Exit Flow', trigger: 'Match End', actions: 8, lastFired: '2 days ago' }
];

type Cascade = typeof PREBUILT_CASCADES[0];

export default function CascadeBuilder() {
  const [executing, setExecuting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCascade, setSelectedCascade] = useState<Cascade | null>(null);

  const handleExecute = (id: string) => {
    setExecuting(id);
    setTimeout(() => setExecuting(null), 2000);
    setModalOpen(false);
    setSelectedCascade(null);
  };

  const openModal = (cascade: Cascade) => {
    setSelectedCascade(cascade);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Cascade Actions</h2>
        <button className="text-xs text-amber-500 hover:text-amber-400 border border-amber-500/30 px-2 py-1 rounded">
          + Custom Cascade
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {PREBUILT_CASCADES.map(cascade => (
          <div key={cascade.id} className="bg-slate-800 border border-slate-700 p-3 rounded flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white">{cascade.name}</h3>
                <div className="text-xs text-slate-400 mt-1 flex gap-3">
                  <span>Trigger: <span className="text-slate-300">{cascade.trigger}</span></span>
                  <span>Actions: <span className="text-slate-300 font-mono-numbers">{cascade.actions}</span></span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-700">
              <span className="text-[10px] text-slate-500">Last fired: {cascade.lastFired}</span>
              <button 
                onClick={() => openModal(cascade)}
                disabled={executing !== null}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-1.5 rounded transition-colors disabled:opacity-50"
              >
                {executing === cascade.id ? 'EXECUTING...' : 'EXECUTE NOW'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCascade && (
        <ConfirmModal
          isOpen={modalOpen}
          title={selectedCascade.name}
          description="This will deploy staff and trigger fan notifications."
          details={Array.from({ length: selectedCascade.actions }, (_, i) => `Action ${i + 1} of ${selectedCascade.actions}`)}
          onConfirm={() => handleExecute(selectedCascade.id)}
          onCancel={() => { setModalOpen(false); setSelectedCascade(null); }}
          confirmLabel="EXECUTE NOW"
        />
      )}
    </div>
  );
}

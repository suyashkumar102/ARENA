import FanCompanion from '@/components/fan/FanCompanion';
import LiveBadge from '@/components/shared/LiveBadge';

export default function FanPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex justify-center">
      <div className="w-full max-w-[430px] bg-[#0a0f18] min-h-screen shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header */}
        <header className="p-4 flex justify-between items-center z-10 relative">
          <div className="flex items-center gap-2">
            <LiveBadge label="ARENA" />
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-xs font-bold text-slate-300">Wankhede</span>
            <span className="text-[10px] text-slate-500 font-mono-numbers">MI vs CSK</span>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto z-10 relative pb-10">
          <FanCompanion />
        </main>
      </div>
    </div>
  );
}

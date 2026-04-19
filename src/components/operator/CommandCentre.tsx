'use client';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import MatchStatePanel from './MatchStatePanel';
import ZoneHeatmap from './ZoneHeatmap';
import PredictionTimeline from './PredictionTimeline';
import AiBriefing from './AiBriefing';
import QueuePanel from './QueuePanel';
import StaffMap from './StaffMap';
import CascadeBuilder from './CascadeBuilder';
import IncidentFeed from './IncidentFeed';
import FanBroadcast from './FanBroadcast';

export default function CommandCentre() {
  const router = useRouter();

  const handleSignOut = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    router.replace('/operator/login');
  };

  return (
    <div className="flex flex-col h-full gap-4 text-sm">
      {/* Top Bar / Match State */}
      <div className="shrink-0 flex items-start justify-between gap-4">
        <div className="flex-1">
          <MatchStatePanel />
        </div>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="shrink-0 mt-1 px-3 py-1.5 text-xs text-slate-400 border border-slate-700 rounded hover:border-slate-500 hover:text-slate-200 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 grid-rows-3 gap-4 min-h-0">
        
        {/* Left Column (Zone Map) */}
        <div className="col-span-3 row-span-2 bg-[#1E293B] border border-slate-700 rounded-lg overflow-hidden flex flex-col">
          <ZoneHeatmap />
        </div>

        {/* Middle Column (Prediction Timeline, Queues, Incidents) */}
        <div className="col-span-6 row-span-2 flex flex-col gap-4">
          <div className="flex-1 bg-[#1E293B] border border-slate-700 rounded-lg overflow-hidden">
            <PredictionTimeline />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-[#1E293B] border border-slate-700 rounded-lg overflow-hidden">
              <QueuePanel />
            </div>
            <div className="bg-[#1E293B] border border-slate-700 rounded-lg overflow-hidden">
              <StaffMap />
            </div>
          </div>
        </div>

        {/* Right Column (AI Briefing, Cascade Actions) */}
        <div className="col-span-3 row-span-3 flex flex-col gap-4">
          <div className="flex-1 bg-[#1E293B] border border-slate-700 rounded-lg overflow-hidden">
            <AiBriefing />
          </div>
          <div className="flex-[2] bg-[#1E293B] border border-slate-700 rounded-lg overflow-hidden">
            <CascadeBuilder />
          </div>
        </div>

        {/* Bottom Row - Left (Incidents) */}
        <div className="col-span-9 row-span-1 bg-[#1E293B] border border-slate-700 rounded-lg overflow-hidden flex flex-col">
          <div className="flex flex-1 gap-4 overflow-hidden">
            <div className="flex-1 border-r border-slate-700 overflow-hidden">
              <IncidentFeed />
            </div>
            <div className="flex-1 overflow-hidden">
              <FanBroadcast />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import type { StaffMember } from '@/types/arena.types';

const DEMO_STAFF: StaffMember[] = [
  { id: 's1', name: 'Rahul Sharma',  role: 'security',   currentZone: 'north-stand',     status: 'active'    },
  { id: 's2', name: 'Priya Nair',    role: 'steward',    currentZone: 'south-stand',     status: 'active'    },
  { id: 's3', name: 'Amit Patel',    role: 'concession', currentZone: 'concession-n1',   status: 'active'    },
  { id: 's4', name: 'Sunita Rao',    role: 'medical',    currentZone: 'medical-bay',     status: 'active'    },
  { id: 's5', name: 'Vikram Singh',  role: 'security',   currentZone: 'gate-a',          status: 'responding'},
  { id: 's6', name: 'Deepa Menon',   role: 'steward',    currentZone: 'east-stand',      status: 'active'    },
  { id: 's7', name: 'Arjun Kumar',   role: 'concession', currentZone: 'concession-s1',   status: 'break'     },
  { id: 's8', name: 'Kavya Reddy',   role: 'security',   currentZone: 'north-concourse', status: 'active'    },
];

const ZONE_LABELS: Record<string, string> = {
  'north-stand':     'North Stand',
  'south-stand':     'South Stand',
  'east-stand':      'East Stand',
  'west-stand':      'West Stand',
  'north-concourse': 'North Concourse',
  'south-concourse': 'South Concourse',
  'gate-a':          'Gate A',
  'gate-b':          'Gate B',
  'gate-c':          'Gate C',
  'gate-d':          'Gate D',
  'concession-n1':   'North Food Court 1',
  'concession-n2':   'North Food Court 2',
  'concession-n3':   'North Beverage',
  'concession-s1':   'South Food Court 1',
  'concession-s2':   'South Food Court 2',
  'medical-bay':     'Medical Bay',
  'vip-lounge':      'VIP Lounge',
};

function roleBadgeClass(role: StaffMember['role']): string {
  switch (role) {
    case 'security':   return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'steward':    return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'concession': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'medical':    return 'bg-green-500/20 text-green-400 border border-green-500/30';
  }
}

function StatusDot({ status }: { status: StaffMember['status'] }) {
  if (status === 'responding') {
    return (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
    );
  }
  if (status === 'break') {
    return <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />;
  }
  return <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />;
}

export default function StaffMap() {
  const [staff, setStaff] = useState<StaffMember[]>(DEMO_STAFF);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return;

    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { db, isFirebaseConfigured } = await import('@/lib/firebase');
        if (!isFirebaseConfigured || !db) return;
        const { ref, onValue } = await import('firebase/database');
        const staffRef = ref(db, 'arena/wankhede-2026-mi-csk/staff');
        unsubscribe = onValue(staffRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val() as Record<string, StaffMember>;
            const members = Object.values(data);
            setStaff(members.length > 0 ? members : DEMO_STAFF);
          } else {
            setStaff(DEMO_STAFF);
          }
        });
      } catch {
        setStaff(DEMO_STAFF);
      }
    })();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Staff Deployment</h2>
        <span className="text-[10px] text-slate-500 font-mono">TOTAL: {staff.length}</span>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
        {staff.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-2 rounded bg-[#1E293B] border border-slate-700"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">{member.name}</span>
              <span className="text-[10px] text-slate-500 truncate">
                {ZONE_LABELS[member.currentZone] ?? member.currentZone}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${roleBadgeClass(member.role)}`}
              >
                {member.role}
              </span>
              <StatusDot status={member.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

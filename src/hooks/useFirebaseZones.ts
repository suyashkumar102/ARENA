'use client';
import { useState, useEffect } from 'react';
import { Zone, ZoneId } from '@/types/arena.types';
import { isFirebaseConfigured } from '@/lib/firebase';

// Demo data fallback
const DEMO_ZONES: Record<ZoneId, Zone> = {
  'north-stand': { id: 'north-stand', name: 'North Stand', capacity: 15000, current: 14100, status: 'critical', queueMinutes: 1, staffDeployed: 12, staffRequired: 15, lastUpdated: Date.now() },
  'south-stand': { id: 'south-stand', name: 'South Stand', capacity: 15000, current: 13350, status: 'busy', queueMinutes: 0, staffDeployed: 10, staffRequired: 10, lastUpdated: Date.now() },
  'east-stand': { id: 'east-stand', name: 'East Stand', capacity: 10000, current: 6500, status: 'moderate', queueMinutes: 2, staffDeployed: 8, staffRequired: 8, lastUpdated: Date.now() },
  'west-stand': { id: 'west-stand', name: 'West Stand', capacity: 10000, current: 8500, status: 'busy', queueMinutes: 1, staffDeployed: 8, staffRequired: 8, lastUpdated: Date.now() },
  'north-concourse': { id: 'north-concourse', name: 'North Concourse', capacity: 5000, current: 1150, status: 'clear', queueMinutes: 3, staffDeployed: 4, staffRequired: 6, lastUpdated: Date.now() },
  'south-concourse': { id: 'south-concourse', name: 'South Concourse', capacity: 5000, current: 900, status: 'clear', queueMinutes: 2, staffDeployed: 4, staffRequired: 4, lastUpdated: Date.now() },
  'gate-a': { id: 'gate-a', name: 'Gate A (North)', capacity: 1000, current: 100, status: 'clear', queueMinutes: 2, staffDeployed: 6, staffRequired: 6, lastUpdated: Date.now() },
  'gate-b': { id: 'gate-b', name: 'Gate B (East)', capacity: 1000, current: 150, status: 'clear', queueMinutes: 4, staffDeployed: 6, staffRequired: 6, lastUpdated: Date.now() },
  'gate-c': { id: 'gate-c', name: 'Gate C (South)', capacity: 1000, current: 80, status: 'clear', queueMinutes: 1, staffDeployed: 5, staffRequired: 5, lastUpdated: Date.now() },
  'gate-d': { id: 'gate-d', name: 'Gate D (West)', capacity: 1000, current: 120, status: 'clear', queueMinutes: 2, staffDeployed: 5, staffRequired: 5, lastUpdated: Date.now() },
  'concession-n1': { id: 'concession-n1', name: 'North Food Court 1', capacity: 200, current: 120, status: 'moderate', queueMinutes: 7, staffDeployed: 3, staffRequired: 5, lastUpdated: Date.now() },
  'concession-n2': { id: 'concession-n2', name: 'North Food Court 2', capacity: 200, current: 90, status: 'moderate', queueMinutes: 5, staffDeployed: 3, staffRequired: 3, lastUpdated: Date.now() },
  'concession-n3': { id: 'concession-n3', name: 'North Beverage', capacity: 100, current: 85, status: 'busy', queueMinutes: 8, staffDeployed: 2, staffRequired: 3, lastUpdated: Date.now() },
  'concession-s1': { id: 'concession-s1', name: 'South Food Court 1', capacity: 200, current: 150, status: 'busy', queueMinutes: 8, staffDeployed: 4, staffRequired: 4, lastUpdated: Date.now() },
  'concession-s2': { id: 'concession-s2', name: 'South Food Court 2', capacity: 200, current: 60, status: 'clear', queueMinutes: 3, staffDeployed: 2, staffRequired: 2, lastUpdated: Date.now() },
  'medical-bay': { id: 'medical-bay', name: 'Primary Medical', capacity: 50, current: 5, status: 'clear', queueMinutes: 0, staffDeployed: 4, staffRequired: 4, lastUpdated: Date.now() },
  'vip-lounge': { id: 'vip-lounge', name: 'VIP Lounge', capacity: 500, current: 300, status: 'moderate', queueMinutes: 0, staffDeployed: 15, staffRequired: 15, lastUpdated: Date.now() },
};

export function useFirebaseZones() {
  const [zones, setZones] = useState<Record<ZoneId, Zone>>(DEMO_ZONES);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Demo mode: simulate live zone fluctuations every 4 seconds
      setZones(DEMO_ZONES);

      const simulateTick = () => {
        setZones(prev => {
          const updated = { ...prev };
          // Randomly fluctuate 3-4 zones per tick to look live
          const zoneIds = Object.keys(updated) as ZoneId[];
          const toUpdate = zoneIds.sort(() => Math.random() - 0.5).slice(0, 4);

          toUpdate.forEach(id => {
            const zone = { ...updated[id] };
            // Small random delta: ±1-3% of capacity
            const delta = Math.floor((Math.random() - 0.45) * zone.capacity * 0.03);
            zone.current = Math.max(0, Math.min(zone.capacity, zone.current + delta));
            const pct = zone.current / zone.capacity;
            zone.status = pct >= 0.9 ? 'critical' : pct >= 0.75 ? 'busy' : pct >= 0.5 ? 'moderate' : 'clear';
            // Queue time fluctuates slightly
            zone.queueMinutes = Math.max(0, zone.queueMinutes + Math.floor(Math.random() * 3) - 1);
            zone.lastUpdated = Date.now();
            updated[id] = zone;
          });
          return updated;
        });
      };

      const interval = setInterval(simulateTick, 4000);
      return () => clearInterval(interval);
    }

    // Live Firebase subscription
    let unsubscribe: (() => void) | undefined;

    import('firebase/database').then(({ ref, onValue }) => {
      import('@/lib/firebase').then(({ db, isFirebaseConfigured }) => {
        if (!isFirebaseConfigured || !db) return;
        const zonesRef = ref(db, 'arena/wankhede-2026-mi-csk/zones');
        unsubscribe = onValue(
          zonesRef,
          (snapshot) => {
            const data = snapshot.val();
            setZones(data ?? DEMO_ZONES);
          },
          (error) => {
            console.warn('Firebase zones error, falling back to demo:', error);
            setZones(DEMO_ZONES);
          }
        );
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // isFirebaseConfigured is a module-level constant, safe to omit

  return zones;
}

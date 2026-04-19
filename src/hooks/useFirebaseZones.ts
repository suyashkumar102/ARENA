'use client';
import { useState, useEffect } from 'react';
import { Zone, ZoneId } from '@/types/arena.types';
import { isFirebaseConfigured } from '@/lib/firebase';

// Demo data — Chinnaswamy Stadium, Bangalore (RCB vs MI)
const DEMO_ZONES: Record<ZoneId, Zone> = {
  'north-stand': { id: 'north-stand', name: 'North Stand (Cubbon Park End)', capacity: 12000, current: 11280, status: 'critical', queueMinutes: 1, staffDeployed: 10, staffRequired: 13, lastUpdated: Date.now() },
  'south-stand': { id: 'south-stand', name: 'South Stand (KSCA End)', capacity: 12000, current: 10440, status: 'busy', queueMinutes: 0, staffDeployed: 9, staffRequired: 9, lastUpdated: Date.now() },
  'east-stand': { id: 'east-stand', name: 'East Stand', capacity: 8000, current: 5200, status: 'moderate', queueMinutes: 2, staffDeployed: 6, staffRequired: 6, lastUpdated: Date.now() },
  'west-stand': { id: 'west-stand', name: 'West Stand (Members Pavilion)', capacity: 8000, current: 6800, status: 'busy', queueMinutes: 1, staffDeployed: 7, staffRequired: 7, lastUpdated: Date.now() },
  'north-concourse': { id: 'north-concourse', name: 'North Concourse', capacity: 4000, current: 920, status: 'clear', queueMinutes: 3, staffDeployed: 3, staffRequired: 5, lastUpdated: Date.now() },
  'south-concourse': { id: 'south-concourse', name: 'South Concourse', capacity: 4000, current: 720, status: 'clear', queueMinutes: 2, staffDeployed: 3, staffRequired: 3, lastUpdated: Date.now() },
  'gate-a': { id: 'gate-a', name: 'Gate A (North)', capacity: 800, current: 80, status: 'clear', queueMinutes: 2, staffDeployed: 5, staffRequired: 5, lastUpdated: Date.now() },
  'gate-b': { id: 'gate-b', name: 'Gate B (East)', capacity: 800, current: 120, status: 'clear', queueMinutes: 4, staffDeployed: 5, staffRequired: 5, lastUpdated: Date.now() },
  'gate-c': { id: 'gate-c', name: 'Gate C (South)', capacity: 800, current: 64, status: 'clear', queueMinutes: 1, staffDeployed: 4, staffRequired: 4, lastUpdated: Date.now() },
  'gate-d': { id: 'gate-d', name: 'Gate D (West)', capacity: 800, current: 96, status: 'clear', queueMinutes: 2, staffDeployed: 4, staffRequired: 4, lastUpdated: Date.now() },
  'concession-n1': { id: 'concession-n1', name: 'North Food Court 1', capacity: 200, current: 120, status: 'moderate', queueMinutes: 7, staffDeployed: 3, staffRequired: 4, lastUpdated: Date.now() },
  'concession-n2': { id: 'concession-n2', name: 'North Food Court 2', capacity: 200, current: 90, status: 'moderate', queueMinutes: 5, staffDeployed: 3, staffRequired: 3, lastUpdated: Date.now() },
  'concession-n3': { id: 'concession-n3', name: 'North Beverage Stall', capacity: 100, current: 85, status: 'busy', queueMinutes: 8, staffDeployed: 2, staffRequired: 3, lastUpdated: Date.now() },
  'concession-s1': { id: 'concession-s1', name: 'South Food Court 1', capacity: 200, current: 150, status: 'busy', queueMinutes: 8, staffDeployed: 4, staffRequired: 4, lastUpdated: Date.now() },
  'concession-s2': { id: 'concession-s2', name: 'South Food Court 2', capacity: 200, current: 60, status: 'clear', queueMinutes: 3, staffDeployed: 2, staffRequired: 2, lastUpdated: Date.now() },
  'medical-bay': { id: 'medical-bay', name: 'Medical Bay', capacity: 50, current: 5, status: 'clear', queueMinutes: 0, staffDeployed: 4, staffRequired: 4, lastUpdated: Date.now() },
  'vip-lounge': { id: 'vip-lounge', name: 'VIP Lounge (Members Pavilion)', capacity: 400, current: 240, status: 'moderate', queueMinutes: 0, staffDeployed: 12, staffRequired: 12, lastUpdated: Date.now() },
};

export function useFirebaseZones() {
  const [zones, setZones] = useState<Record<ZoneId, Zone>>(DEMO_ZONES);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let simInterval: ReturnType<typeof setInterval> | undefined;

    const startSimulation = () => {
      if (simInterval) return; // already running
      simInterval = setInterval(() => {
        setZones(prev => {
          const updated = { ...prev };
          const zoneIds = Object.keys(updated) as ZoneId[];
          const toUpdate = zoneIds.sort(() => Math.random() - 0.5).slice(0, 4);
          toUpdate.forEach(id => {
            const zone = { ...updated[id] };
            const delta = Math.floor((Math.random() - 0.45) * zone.capacity * 0.03);
            zone.current = Math.max(0, Math.min(zone.capacity, zone.current + delta));
            const pct = zone.current / zone.capacity;
            zone.status = pct >= 0.9 ? 'critical' : pct >= 0.75 ? 'busy' : pct >= 0.5 ? 'moderate' : 'clear';
            zone.queueMinutes = Math.max(0, zone.queueMinutes + Math.floor(Math.random() * 3) - 1);
            zone.lastUpdated = Date.now();
            updated[id] = zone;
          });
          return updated;
        });
      }, 4000);
    };

    if (!isFirebaseConfigured) {
      // No Firebase — run simulation immediately
      startSimulation();
      return () => { if (simInterval) clearInterval(simInterval); };
    }

    // Firebase configured — subscribe, but fall back to simulation if no data
    import('firebase/database').then(({ ref, onValue }) => {
      import('@/lib/firebase').then(({ db, isFirebaseConfigured: configured }) => {
        if (!configured || !db) { startSimulation(); return; }
        const zonesRef = ref(db, 'arena/chinnaswamy-2026-rcb-mi/zones');
        unsubscribe = onValue(
          zonesRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              // Real data exists — stop simulation, use Firebase
              if (simInterval) { clearInterval(simInterval); simInterval = undefined; }
              setZones(data);
            } else {
              // Firebase connected but no data — run simulation
              startSimulation();
            }
          },
          (error) => {
            console.warn('Firebase zones error, falling back to simulation:', error);
            startSimulation();
          }
        );
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (simInterval) clearInterval(simInterval);
    };
  }, []);

  return zones;
}

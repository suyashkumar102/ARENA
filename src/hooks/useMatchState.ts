'use client';
import { useState, useEffect } from 'react';
import { MatchState } from '@/types/arena.types';
import { getDemoMatchState } from '@/lib/match-state';
import { isFirebaseConfigured } from '@/lib/firebase';

export function useMatchState(): MatchState {
  const [matchState, setMatchState] = useState<MatchState>(getDemoMatchState());

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (isFirebaseConfigured) {
      // Live Firebase subscription
      import('firebase/database').then(({ ref, onValue }) => {
        import('@/lib/firebase').then(({ db }) => {
          const stateRef = ref(db, 'arena/wankhede-2026-mi-csk/matchState');
          unsubscribe = onValue(
            stateRef,
            (snapshot) => {
              const data = snapshot.val();
              if (data) setMatchState(data);
            },
            (error) => {
              console.warn('Firebase matchState error, falling back to demo:', error);
              setMatchState(getDemoMatchState());
            }
          );
        });
      });
    }

    // Countdown tick — runs in both modes (UI-only)
    const interval = setInterval(() => {
      setMatchState(prev => ({
        ...prev,
        timeToNextPhaseMs: Math.max(0, prev.timeToNextPhaseMs - 1000),
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, []); // isFirebaseConfigured is a module-level constant, safe to omit

  return matchState;
}

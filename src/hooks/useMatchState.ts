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
        import('@/lib/firebase').then(({ db, isFirebaseConfigured }) => {
          if (!isFirebaseConfigured || !db) return;
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

    // Demo mode: simulate match progress every 8 seconds
    let matchSimInterval: ReturnType<typeof setInterval> | undefined;
    if (!isFirebaseConfigured) {
      matchSimInterval = setInterval(() => {
        setMatchState(prev => {
          const newBall = prev.ball >= 6 ? 1 : prev.ball + 1;
          const newOver = prev.ball >= 6 ? prev.over + 1 : prev.over;
          // Occasionally add runs
          const runsScored = Math.random() > 0.4 ? Math.floor(Math.random() * 6) : 0;
          const wicketFell = Math.random() > 0.92;
          const events = ['dot ball', 'single', 'two runs', 'four!', 'SIX!', 'wide', 'wicket!'];
          const eventDescriptions = ['Defended back', 'Pushed to mid-on', 'Driven through covers', 'Cracking cover drive', 'Massive hit over long-on', 'Down leg side', 'Caught at slip'];
          const eventIdx = runsScored === 0 ? 0 : runsScored === 1 ? 1 : runsScored === 2 ? 2 : runsScored === 4 ? 3 : 4;
          // Tension fluctuates
          const newTension = Math.max(10, Math.min(95, prev.tensionIndex + Math.floor((Math.random() - 0.45) * 8)));
          return {
            ...prev,
            ball: newBall,
            over: newOver,
            scoreTeam1: prev.scoreTeam1 + runsScored,
            wicketsTeam1: wicketFell ? Math.min(10, prev.wicketsTeam1 + 1) : prev.wicketsTeam1,
            tensionIndex: newTension,
            timeToNextPhaseMs: Math.max(0, prev.timeToNextPhaseMs - 8000),
            lastEvent: {
              type: wicketFell ? 'wicket' : runsScored === 4 ? 'four' : runsScored === 6 ? 'six' : 'ball',
              timestamp: Date.now(),
              description: wicketFell ? 'Wicket! Caught behind' : eventDescriptions[eventIdx] || events[eventIdx],
            },
          };
        });
      }, 8000);
    }

    return () => {
      clearInterval(interval);
      if (matchSimInterval) clearInterval(matchSimInterval);
      if (unsubscribe) unsubscribe();
    };
  }, []); // isFirebaseConfigured is a module-level constant, safe to omit

  return matchState;
}

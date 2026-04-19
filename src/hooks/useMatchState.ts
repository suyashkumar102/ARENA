'use client';
import { useState, useEffect } from 'react';
import { MatchState } from '@/types/arena.types';
import { getDemoMatchState } from '@/lib/match-state';
import { isFirebaseConfigured } from '@/lib/firebase';

const simulateMatchTick = (prev: MatchState): MatchState => {
  const newBall = prev.ball >= 6 ? 1 : prev.ball + 1;
  const newOver = prev.ball >= 6 ? prev.over + 1 : prev.over;
  const runsScored = Math.random() > 0.4 ? Math.floor(Math.random() * 6) : 0;
  const wicketFell = Math.random() > 0.92;
  const eventDescriptions = ['Defended back', 'Pushed to mid-on', 'Driven through covers', 'Cracking cover drive', 'Massive hit over long-on', 'Down leg side', 'Caught at slip'];
  const eventIdx = runsScored === 0 ? 0 : runsScored === 1 ? 1 : runsScored === 2 ? 2 : runsScored === 4 ? 3 : 4;
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
      type: wicketFell ? 'wicket' : runsScored === 4 ? 'four' : runsScored === 6 ? 'six' : 'review',
      timestamp: Date.now(),
      description: wicketFell ? 'Wicket! Caught behind' : eventDescriptions[eventIdx] ?? 'Defended back',
    },
  };
};

export function useMatchState(): MatchState {
  const [matchState, setMatchState] = useState<MatchState>(getDemoMatchState());
  const [hasFirebaseData, setHasFirebaseData] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let matchSimInterval: ReturnType<typeof setInterval> | undefined;

    if (isFirebaseConfigured) {
      import('firebase/database').then(({ ref, onValue }) => {
        import('@/lib/firebase').then(({ db, isFirebaseConfigured: configured }) => {
          if (!configured || !db) return;
          const stateRef = ref(db, 'arena/chinnaswamy-2026-rcb-mi/matchState');
          unsubscribe = onValue(
            stateRef,
            (snapshot) => {
              const data = snapshot.val();
              if (data) {
                setHasFirebaseData(true);
                setMatchState(data);
              }
              // If no data, simulation will kick in via the hasFirebaseData=false path
            },
            (error) => {
              console.warn('Firebase matchState error, falling back to simulation:', error);
            }
          );
        });
      });
    }

    // Countdown tick — always runs
    const interval = setInterval(() => {
      setMatchState(prev => ({
        ...prev,
        timeToNextPhaseMs: Math.max(0, prev.timeToNextPhaseMs - 1000),
      }));
    }, 1000);

    // Match simulation — runs when no Firebase data available
    if (!isFirebaseConfigured || !hasFirebaseData) {
      matchSimInterval = setInterval(() => {
        setMatchState(prev => simulateMatchTick(prev));
      }, 8000);
    }

    return () => {
      clearInterval(interval);
      if (matchSimInterval) clearInterval(matchSimInterval);
      if (unsubscribe) unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return matchState;
}

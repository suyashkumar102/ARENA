import { MatchState } from '@/types/arena.types';

export const getDemoMatchState = (): MatchState => {
  return {
    phase: 'powerplay-1',
    over: 14,
    ball: 3,
    scoreTeam1: 98,
    wicketsTeam1: 2,
    scoreTeam2: 0,
    wicketsTeam2: 0,
    tensionIndex: 62,
    lastEvent: {
      type: 'four',
      timestamp: Date.now() - 30000,
      description: 'Four down the ground'
    },
    timeToNextPhaseMs: 22 * 60 * 1000 // ~22 mins
  };
};

export const simulateMatchProgress = (currentState: MatchState): MatchState => {
  // Demo mode: just mock some progress if needed
  return {
    ...currentState,
    ball: currentState.ball === 6 ? 1 : currentState.ball + 1,
    over: currentState.ball === 6 ? currentState.over + 1 : currentState.over,
  };
};

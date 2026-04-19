import { MatchState } from '@/types/arena.types';

export const getDemoMatchState = (): MatchState => {
  return {
    phase: 'powerplay-1',
    over: 7,
    ball: 2,
    scoreTeam1: 54,
    wicketsTeam1: 1,
    scoreTeam2: 0,
    wicketsTeam2: 0,
    tensionIndex: 71,
    lastEvent: {
      type: 'six',
      timestamp: Date.now() - 15000,
      description: 'SIX! Virat pulls it over mid-wicket'
    },
    timeToNextPhaseMs: 18 * 60 * 1000 // ~18 mins to end of powerplay
  };
};

export const simulateMatchProgress = (currentState: MatchState): MatchState => {
  return {
    ...currentState,
    ball: currentState.ball === 6 ? 1 : currentState.ball + 1,
    over: currentState.ball === 6 ? currentState.over + 1 : currentState.over,
  };
};

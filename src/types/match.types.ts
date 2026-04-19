/** Match state and event types for ARENA. Separated from arena.types.ts for modularity. */

export type MatchPhase = 
  | 'pre-match' 
  | 'powerplay-1' 
  | 'middle-overs' 
  | 'death-overs-1'
  | 'innings-break'
  | 'powerplay-2'
  | 'chase-middle'
  | 'chase-climax'
  | 'post-match';

export interface MatchEvent {
  type: 'wicket' | 'six' | 'four' | 'drinks-break' | 'innings-end' | 'match-end' | 'review';
  timestamp: number;
  description: string;
}

export interface MatchState {
  phase: MatchPhase;
  over: number;
  ball: number;
  scoreTeam1: number;
  wicketsTeam1: number;
  scoreTeam2: number;
  wicketsTeam2: number;
  tensionIndex: number;  // 0-100
  lastEvent: MatchEvent | null;
  timeToNextPhaseMs: number;
}

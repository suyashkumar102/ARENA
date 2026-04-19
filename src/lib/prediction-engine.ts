// The core insight: match phase + tension index + historical patterns 
// = predictable crowd state

import { Zone, MatchState, CrowdPrediction, ZoneId, ZoneStatus, MatchPhase } from '@/types/arena.types';

// Historical crowd flow patterns per match phase (% of capacity expected)
const PHASE_PATTERNS: Record<string, Partial<Record<ZoneId, number>>> = {
  'powerplay-1': {
    'north-stand': 0.95, 'south-stand': 0.92, 'north-concourse': 0.15,
    'south-concourse': 0.18, 'concession-n1': 0.20, 'concession-s1': 0.25,
  },
  'innings-break': {
    'north-stand': 0.30, 'south-stand': 0.28, 'north-concourse': 0.85,
    'south-concourse': 0.80, 'concession-n1': 0.90, 'concession-s1': 0.88,
  },
  'death-overs-1': {
    'north-stand': 0.98, 'south-stand': 0.97, 'north-concourse': 0.05,
    'south-concourse': 0.05, 'concession-n1': 0.08,
  },
};

export function generatePredictions(
  zones: Record<ZoneId, Zone>,
  matchState: MatchState,
  minutesAhead: number = 10
): CrowdPrediction[] {
  const nextPhase = getNextPhase(matchState);
  const pattern = PHASE_PATTERNS[nextPhase] ?? PHASE_PATTERNS[matchState.phase] ?? {};
  
  return Object.values(zones).map(zone => {
    const expectedFill = pattern[zone.id] ?? 0.5;
    const tensionModifier = 1 + (matchState.tensionIndex / 100) * 0.15;
    const predictedCount = Math.round(zone.capacity * expectedFill * tensionModifier);
    
    return {
      zoneId: zone.id,
      predictedStatus: countToStatus(predictedCount, zone.capacity),
      predictedCount,
      confidencePercent: calculateConfidence(matchState, minutesAhead),
      minutesAhead,
      triggerEvent: `Transition to ${nextPhase}`,
    };
  });
}

export function calculateConfidence(state: MatchState, minutesAhead: number): number {
  const baseConfidence = 85;
  const timeDecay = minutesAhead * 2;
  const tensionPenalty = state.tensionIndex > 80 ? 10 : 0; // High tension = less predictable
  return Math.max(60, baseConfidence - timeDecay - tensionPenalty);
}

export function countToStatus(count: number, capacity: number): ZoneStatus {
  const ratio = count / capacity;
  if (ratio < 0.4) return 'clear';
  if (ratio < 0.65) return 'moderate';
  if (ratio < 0.85) return 'busy';
  return 'critical';
}

export function getNextPhase(state: MatchState): MatchPhase {
  const transitions: Record<MatchPhase, MatchPhase> = {
    'pre-match': 'powerplay-1',
    'powerplay-1': 'middle-overs',
    'middle-overs': 'death-overs-1',
    'death-overs-1': 'innings-break',
    'innings-break': 'powerplay-2',
    'powerplay-2': 'chase-middle',
    'chase-middle': 'chase-climax',
    'chase-climax': 'post-match',
    'post-match': 'post-match',
  };
  return transitions[state.phase] || state.phase;
}

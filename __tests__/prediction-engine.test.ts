import { generatePredictions, calculateConfidence } from '../src/lib/prediction-engine';
import { MatchState, Zone, ZoneId } from '../src/types/arena.types';

describe('PredictionEngine', () => {
  const mockMatchState: MatchState = {
    phase: 'death-overs-1',
    over: 18,
    ball: 1,
    scoreTeam1: 150,
    wicketsTeam1: 4,
    scoreTeam2: 0,
    wicketsTeam2: 0,
    tensionIndex: 85,
    lastEvent: null,
    timeToNextPhaseMs: 500000
  };

  const mockZones: Record<ZoneId, Zone> = {
    'north-concourse': { id: 'north-concourse', name: 'North Concourse', capacity: 1000, current: 100, status: 'clear', queueMinutes: 1, staffDeployed: 2, staffRequired: 2, lastUpdated: 0 } as Zone,
    'north-stand': { id: 'north-stand', name: 'North Stand', capacity: 5000, current: 4800, status: 'critical', queueMinutes: 0, staffDeployed: 5, staffRequired: 5, lastUpdated: 0 } as Zone,
  } as Record<ZoneId, Zone>;

  test('predicts high concourse density during innings break', () => {
    const state = { ...mockMatchState, phase: 'death-overs-1' }; // Next phase will be innings-break
    const preds = generatePredictions(mockZones, state, 10);
    const concoursePred = preds.find(p => p.zoneId === 'north-concourse');
    // Innings break pattern is 0.85
    const expectedFill = 1000 * 0.85;
    const modifier = 1 + (state.tensionIndex / 100) * 0.15;
    expect(concoursePred?.predictedCount).toBe(Math.round(expectedFill * modifier));
  });

  test('predicts low movement during death overs close match', () => {
    const state = { ...mockMatchState, phase: 'middle-overs' }; // Next phase is death-overs-1
    const preds = generatePredictions(mockZones, state, 10);
    const concoursePred = preds.find(p => p.zoneId === 'north-concourse');
    const expectedFill = 1000 * 0.05;
    const modifier = 1 + (state.tensionIndex / 100) * 0.15;
    expect(concoursePred?.predictedCount).toBe(Math.round(expectedFill * modifier));
  });

  test('confidence decreases with more minutes ahead', () => {
    const stateLowTension = { ...mockMatchState, tensionIndex: 50 };
    const conf10 = calculateConfidence(stateLowTension, 10);
    const conf20 = calculateConfidence(stateLowTension, 20);
    expect(conf10).toBeGreaterThan(conf20);
  });

  test('high tension index increases crowd density modifier', () => {
    const predsHighTension = generatePredictions(mockZones, mockMatchState, 10);
    const predsLowTension = generatePredictions(mockZones, { ...mockMatchState, tensionIndex: 20 }, 10);
    
    expect(predsHighTension[0].predictedCount).toBeGreaterThan(predsLowTension[0].predictedCount);
  });
});

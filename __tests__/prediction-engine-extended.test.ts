import { generatePredictions, getNextPhase, countToStatus, calculateConfidence } from '../src/lib/prediction-engine';
import { MatchState, Zone, ZoneId } from '../src/types/arena.types';

const baseMatchState: MatchState = {
  phase: 'powerplay-1',
  over: 5,
  ball: 3,
  scoreTeam1: 45,
  wicketsTeam1: 0,
  scoreTeam2: 0,
  wicketsTeam2: 0,
  tensionIndex: 60,
  lastEvent: null,
  timeToNextPhaseMs: 600000,
};

const mockZones: Record<ZoneId, Zone> = {
  'north-stand': { id: 'north-stand', name: 'North Stand', capacity: 12000, current: 11000, status: 'critical', queueMinutes: 0, staffDeployed: 10, staffRequired: 13, lastUpdated: 0 },
  'north-concourse': { id: 'north-concourse', name: 'North Concourse', capacity: 4000, current: 600, status: 'clear', queueMinutes: 2, staffDeployed: 3, staffRequired: 5, lastUpdated: 0 },
  'concession-n1': { id: 'concession-n1', name: 'North Food Court 1', capacity: 200, current: 40, status: 'clear', queueMinutes: 3, staffDeployed: 2, staffRequired: 3, lastUpdated: 0 },
} as Record<ZoneId, Zone>;

describe('getNextPhase', () => {
  test('powerplay-1 transitions to middle-overs', () => {
    expect(getNextPhase({ ...baseMatchState, phase: 'powerplay-1' })).toBe('middle-overs');
  });

  test('innings-break transitions to powerplay-2', () => {
    expect(getNextPhase({ ...baseMatchState, phase: 'innings-break' })).toBe('powerplay-2');
  });

  test('post-match stays at post-match', () => {
    expect(getNextPhase({ ...baseMatchState, phase: 'post-match' })).toBe('post-match');
  });

  test('chase-climax transitions to post-match', () => {
    expect(getNextPhase({ ...baseMatchState, phase: 'chase-climax' })).toBe('post-match');
  });
});

describe('countToStatus boundaries', () => {
  test('below 40% is clear', () => {
    expect(countToStatus(399, 1000)).toBe('clear');
  });

  test('below 65% is moderate', () => {
    expect(countToStatus(649, 1000)).toBe('moderate');
  });

  test('below 85% is busy', () => {
    expect(countToStatus(849, 1000)).toBe('busy');
  });

  test('at or above 85% is critical', () => {
    expect(countToStatus(850, 1000)).toBe('critical');
    expect(countToStatus(1000, 1000)).toBe('critical');
  });
});

describe('calculateConfidence', () => {
  test('returns at least 60 even with high minutes ahead', () => {
    const conf = calculateConfidence(baseMatchState, 100);
    expect(conf).toBeGreaterThanOrEqual(60);
  });

  test('high tension reduces confidence', () => {
    const highTension = { ...baseMatchState, tensionIndex: 90 };
    const lowTension = { ...baseMatchState, tensionIndex: 30 };
    expect(calculateConfidence(highTension, 10)).toBeLessThan(calculateConfidence(lowTension, 10));
  });
});

describe('generatePredictions', () => {
  test('returns a prediction for every zone passed in', () => {
    const preds = generatePredictions(mockZones, baseMatchState, 10);
    expect(preds.length).toBe(Object.keys(mockZones).length);
  });

  test('each prediction has required fields', () => {
    const preds = generatePredictions(mockZones, baseMatchState, 10);
    preds.forEach(p => {
      expect(p.zoneId).toBeDefined();
      expect(p.predictedStatus).toBeDefined();
      expect(p.predictedCount).toBeGreaterThanOrEqual(0);
      expect(p.confidencePercent).toBeGreaterThanOrEqual(60);
      expect(p.minutesAhead).toBe(10);
      expect(p.triggerEvent).toBeTruthy();
    });
  });

  test('innings-break phase predicts high concourse density', () => {
    const state = { ...baseMatchState, phase: 'death-overs-1' as const }; // next = innings-break
    const preds = generatePredictions(mockZones, state, 10);
    const concoursePred = preds.find(p => p.zoneId === 'north-concourse');
    expect(concoursePred?.predictedStatus).toMatch(/busy|critical/);
  });
});

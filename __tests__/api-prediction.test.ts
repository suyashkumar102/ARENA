/**
 * @jest-environment node
 */
import { POST } from '../src/app/api/prediction/route';
import { NextRequest } from 'next/server';

describe('POST /api/prediction', () => {
  const mockMatchState = {
    phase: 'death-overs-1', over: 18, ball: 1, scoreTeam1: 150, wicketsTeam1: 4, scoreTeam2: 0, wicketsTeam2: 0, tensionIndex: 85, timeToNextPhaseMs: 500000
  };
  const mockZones = {
    'north-concourse': { id: 'north-concourse', name: 'North Concourse', capacity: 1000, current: 100, status: 'clear', queueMinutes: 1, staffDeployed: 2, staffRequired: 2, lastUpdated: 0 }
  };

  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost/api/prediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  };

  test('returns 400 for invalid matchState schema', async () => {
    const req = createRequest({
      matchState: { phase: 'missing-stuff' },
      zones: mockZones,
      minutesAhead: 10
    });
    
    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid request');
  });

  test('returns predictions array for valid input', async () => {
    const req = createRequest({
      matchState: mockMatchState,
      zones: mockZones,
      minutesAhead: 10
    });
    
    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].zoneId).toBe('north-concourse');
  });
});

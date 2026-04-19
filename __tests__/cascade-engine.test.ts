import { executeCascadeSequence } from '../src/lib/cascade-engine';
import { Cascade } from '../src/types/arena.types';

// Mock Firebase Admin
jest.mock('../src/lib/firebase-admin', () => ({
  adminDb: {
    ref: () => ({
      set: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue(true),
    })
  }
}));

describe('CascadeEngine', () => {
  const mockCascade: Cascade = {
    id: 'c1',
    name: 'Test Cascade',
    trigger: 'manual',
    createdAt: 0,
    actions: [
      { id: 'a1', type: 'open-gate', targetZone: 'gate-a', status: 'pending' },
      { id: 'a2', type: 'deploy-staff', targetZone: 'north-stand', status: 'pending' }
    ]
  };

  test('executes actions in correct sequence', async () => {
    const result = await executeCascadeSequence(mockCascade, 'test-event');
    expect(result.actions[0].status).toBe('done');
    expect(result.actions[1].status).toBe('done');
  });

  test('marks failed actions without stopping cascade', async () => {
    let callCount = 0;
    const mockRefObj = {
      set: jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.reject(new Error('Simulated failure'));
        return Promise.resolve(true);
      }),
      update: jest.fn().mockResolvedValue(true)
    };
    const mockDb = require('../src/lib/firebase-admin').adminDb;
    mockDb.ref = jest.fn().mockReturnValue(mockRefObj);

    const result = await executeCascadeSequence(mockCascade, 'test-event');
    expect(result.actions[0].status).toBe('failed');
    expect(result.actions.length).toBe(2);
  });
});

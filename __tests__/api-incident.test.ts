/**
 * @jest-environment node
 */
import { POST } from '../src/app/api/incident/route';
import { NextRequest } from 'next/server';

jest.mock('../src/lib/firebase-admin', () => ({
  adminDb: {
    ref: jest.fn().mockReturnValue({
      set: jest.fn().mockResolvedValue(true),
    }),
  },
}));

describe('POST /api/incident', () => {
  const createRequest = (body: unknown) =>
    new NextRequest('http://localhost/api/incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const validBody = {
    zone: 'north-stand',
    type: 'medical',
    severity: 'medium',
    description: 'Fan collapsed near Block C',
  };

  test('returns 400 for missing required fields', async () => {
    const req = createRequest({ zone: 'north-stand' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid request');
  });

  test('returns 400 for invalid zone', async () => {
    const req = createRequest({ ...validBody, zone: 'invalid-zone' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('returns 400 for invalid incident type', async () => {
    const req = createRequest({ ...validBody, type: 'earthquake' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('returns 400 for description exceeding 200 chars', async () => {
    const req = createRequest({ ...validBody, description: 'x'.repeat(201) });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('returns created incident for valid input', async () => {
    const req = createRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.incident).toBeDefined();
    expect(data.incident.zone).toBe('north-stand');
    expect(data.incident.type).toBe('medical');
    expect(data.incident.severity).toBe('medium');
    expect(data.incident.id).toMatch(/^incident-/);
    expect(data.incident.reportedAt).toBeDefined();
  });

  test('accepts all valid zone IDs', async () => {
    const zones = ['gate-a', 'concession-n1', 'medical-bay', 'vip-lounge'];
    for (const zone of zones) {
      const req = createRequest({ ...validBody, zone });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }
  });
});

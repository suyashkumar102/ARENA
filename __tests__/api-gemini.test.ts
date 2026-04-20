/**
 * @jest-environment node
 */
import { POST } from '../src/app/api/gemini/route';
import { NextRequest } from 'next/server';

// Mock the gemini lib
jest.mock('../src/lib/gemini', () => ({
  generateWithFallback: jest.fn().mockResolvedValue('North Stand is at 94% capacity. Innings break in 22 minutes will surge concourses. Deploy 2 staff to North Food Court 1 immediately.'),
}));

describe('POST /api/gemini', () => {
  const createRequest = (body: unknown, headers: Record<string, string> = {}) => {
    return new NextRequest('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
  };

  const validBriefingBody = {
    type: 'briefing',
    arenaState: { matchState: { phase: 'powerplay-1', tensionIndex: 70 }, zones: {} },
  };

  test('returns 400 for invalid type', async () => {
    const req = createRequest({ type: 'invalid-type', arenaState: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid request format');
  });

  test('returns AI response for valid briefing request', async () => {
    const req = createRequest(validBriefingBody);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.response).toBeTruthy();
    expect(typeof data.response).toBe('string');
  });

  test('returns AI response for fan-assist type', async () => {
    const req = createRequest({
      type: 'fan-assist',
      arenaState: { matchState: {}, zones: {} },
      query: 'Where is the nearest food stall?',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  test('returns AI response for recommendation type', async () => {
    const req = createRequest({
      type: 'recommendation',
      arenaState: { matchState: { phase: 'innings-break', tensionIndex: 60 }, zones: {} },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  test('rate limits after 20 requests from same IP', async () => {
    // Use a unique IP to avoid interference from other tests
    const uniqueIp = '192.168.99.99';
    let lastStatus = 200;
    for (let i = 0; i < 21; i++) {
      const req = createRequest(validBriefingBody, { 'x-forwarded-for': uniqueIp });
      const res = await POST(req);
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });

  test('uses bearer token as rate limit key when provided', async () => {
    const req = createRequest(validBriefingBody, {
      Authorization: 'Bearer test-token-unique-12345',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

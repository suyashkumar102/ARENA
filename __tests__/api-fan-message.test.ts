/**
 * @jest-environment node
 */
import { POST } from '../src/app/api/fan-message/route';
import { NextRequest } from 'next/server';

jest.mock('../src/lib/firebase-admin', () => ({
  adminDb: {
    ref: jest.fn().mockReturnValue({
      push: jest.fn().mockReturnValue({
        key: 'msg-test-123',
        set: jest.fn().mockResolvedValue(true),
      }),
    }),
  },
  adminMessaging: {
    send: jest.fn().mockResolvedValue('message-id-123'),
  },
}));

describe('POST /api/fan-message', () => {
  const createRequest = (body: unknown) =>
    new NextRequest('http://localhost/api/fan-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const validBody = {
    targetZone: 'all',
    headline: 'Stadium Update',
    body: 'Concourses are now open.',
    expiresInMinutes: 30,
  };

  test('returns 400 for missing headline', async () => {
    const req = createRequest({ targetZone: 'all', body: 'test' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('returns 400 for headline exceeding 100 chars', async () => {
    const req = createRequest({ ...validBody, headline: 'x'.repeat(101) });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('returns success with fcmSent field for valid input', async () => {
    const req = createRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.messageId).toBeDefined();
    expect(data.sentAt).toBeDefined();
    expect(typeof data.fcmSent).toBe('boolean');
  });

  test('sends to correct FCM topic for all zones', async () => {
    const { adminMessaging } = require('../src/lib/firebase-admin');
    adminMessaging.send.mockClear();
    const req = createRequest(validBody);
    await POST(req);
    expect(adminMessaging.send).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'arena-chinnaswamy-fans' })
    );
  });

  test('sends to zone-specific FCM topic for targeted zone', async () => {
    const { adminMessaging } = require('../src/lib/firebase-admin');
    adminMessaging.send.mockClear();
    const req = createRequest({ ...validBody, targetZone: 'north-stand' });
    await POST(req);
    expect(adminMessaging.send).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'arena-chinnaswamy-north-stand' })
    );
  });
});

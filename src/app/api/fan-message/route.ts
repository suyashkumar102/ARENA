import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

const RequestSchema = z.object({
  targetZone: z.string(),
  headline: z.string().max(100),
  body: z.string().max(300),
  expiresInMinutes: z.number().default(60),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetZone, headline, body: messageBody, expiresInMinutes } = RequestSchema.parse(body);

    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    const eventId = 'chinnaswamy-2026-rcb-mi';
    const messagesRef = adminDb.ref(`arena/${eventId}/fanMessages`);
    const newMessageRef = messagesRef.push();

    const now = Date.now();
    const message = {
      id: newMessageRef.key,
      targetZone,
      headline,
      body: messageBody,
      sentAt: now,
      expiresAt: now + expiresInMinutes * 60 * 1000,
    };

    await newMessageRef.set(message);

    // FCM push notification
    let fcmSent = false;
    if (adminMessaging) {
      const topic = targetZone === 'all' ? 'arena-chinnaswamy-fans' : `arena-chinnaswamy-${targetZone}`;
      try {
        await adminMessaging.send({
          topic,
          notification: { title: headline, body: messageBody },
        });
        fcmSent = true;
        console.log(`[FCM] Sent to topic: ${topic}`);
      } catch (fcmError) {
        console.error('[FCM] Failed to send push notification:', fcmError);
        // FCM failure does not fail the API response
      }
    } else {
      console.warn('[FCM] adminMessaging is null — skipping push notification');
    }

    return NextResponse.json({ messageId: message.id, sentAt: message.sentAt, fcmSent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Fan Message API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

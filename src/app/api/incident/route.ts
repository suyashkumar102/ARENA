import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';

const ZoneIdSchema = z.enum([
  'north-stand', 'south-stand', 'east-stand', 'west-stand',
  'north-concourse', 'south-concourse',
  'gate-a', 'gate-b', 'gate-c', 'gate-d',
  'concession-n1', 'concession-n2', 'concession-n3',
  'concession-s1', 'concession-s2',
  'medical-bay', 'vip-lounge',
]);

const RequestSchema = z.object({
  zone: ZoneIdSchema,
  type: z.enum(['medical', 'security', 'crowd-surge', 'facility']),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zone, type, severity, description } = RequestSchema.parse(body);

    const now = Date.now();
    const id = `incident-${now}`;

    const incident = {
      id,
      zone,
      type,
      severity,
      description,
      reportedAt: now,
    };

    if (adminDb) {
      const incidentRef = adminDb.ref(`arena/wankhede-2026-mi-csk/incidents/${id}`);
      await incidentRef.set(incident);
    } else {
      console.warn('[Incident API] adminDb not initialized — incident not persisted to Firebase');
    }

    return NextResponse.json({ incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Incident API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

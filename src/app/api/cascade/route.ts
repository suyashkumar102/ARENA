import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeCascadeSequence } from '@/lib/cascade-engine';
import { Cascade } from '@/types/arena.types';

const ActionSchema = z.object({
  id: z.string(),
  type: z.enum(['open-concession', 'deploy-staff', 'push-notification', 'close-gate', 'open-gate', 'alert-security', 'medical-alert']),
  targetZone: z.string(),
  message: z.string().optional(),
  scheduledAt: z.number().optional(),
  executedAt: z.number().optional(),
  status: z.enum(['pending', 'executing', 'done', 'failed']),
});

const CascadeSchema = z.object({
  cascadeId: z.string(),
  actions: z.array(ActionSchema),
  matchEventTrigger: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cascadeId, actions } = CascadeSchema.parse(body);

    const cascade: Cascade = {
      id: cascadeId,
      name: 'Custom Execution',
      trigger: 'manual',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actions: actions as any,
      createdAt: Date.now(),
    };

    const eventId = 'chinnaswamy-2026-rcb-mi';
    const executedCascade = await executeCascadeSequence(cascade, eventId);

    const executedActions = executedCascade.actions;
    const errors = executedActions.filter(a => a.status === 'failed').map(a => `Action ${a.id} failed`);

    return NextResponse.json({ executed: executedActions, errors });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Cascade API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

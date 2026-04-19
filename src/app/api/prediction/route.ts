import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePredictions } from '@/lib/prediction-engine';
import { MatchState, Zone } from '@/types/arena.types';

const MatchStateSchema = z.object({
  phase: z.string(),
  over: z.number(),
  ball: z.number(),
  scoreTeam1: z.number(),
  wicketsTeam1: z.number(),
  scoreTeam2: z.number(),
  wicketsTeam2: z.number(),
  tensionIndex: z.number(),
  timeToNextPhaseMs: z.number(),
});

const ZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  current: z.number(),
  status: z.string(),
  queueMinutes: z.number(),
  staffDeployed: z.number(),
  staffRequired: z.number(),
  lastUpdated: z.number(),
});

const RequestSchema = z.object({
  matchState: MatchStateSchema,
  zones: z.record(z.string(), ZoneSchema),
  minutesAhead: z.number().default(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchState, zones, minutesAhead } = RequestSchema.parse(body);

    const predictions = generatePredictions(
      zones as Record<string, Zone>, 
      matchState as unknown as MatchState, 
      minutesAhead
    );

    return NextResponse.json(predictions);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Prediction API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

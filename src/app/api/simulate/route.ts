import { NextRequest, NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/gemini';
import { ZoneId } from '@/types/arena.types';

const ZONE_CAPACITIES: Record<ZoneId, number> = {
  'north-stand': 12000,
  'south-stand': 12000,
  'east-stand': 8000,
  'west-stand': 8000,
  'north-concourse': 4000,
  'south-concourse': 4000,
  'gate-a': 800,
  'gate-b': 800,
  'gate-c': 800,
  'gate-d': 800,
  'concession-n1': 200,
  'concession-n2': 200,
  'concession-n3': 100,
  'concession-s1': 200,
  'concession-s2': 200,
  'medical-bay': 50,
  'vip-lounge': 400,
};

const ZONE_NAMES: Record<ZoneId, string> = {
  'north-stand': 'North Stand (Cubbon Park End)',
  'south-stand': 'South Stand (KSCA End)',
  'east-stand': 'East Stand',
  'west-stand': 'West Stand (Members Pavilion)',
  'north-concourse': 'North Concourse',
  'south-concourse': 'South Concourse',
  'gate-a': 'Gate A (North)',
  'gate-b': 'Gate B (East)',
  'gate-c': 'Gate C (South)',
  'gate-d': 'Gate D (West)',
  'concession-n1': 'North Food Court 1',
  'concession-n2': 'North Food Court 2',
  'concession-n3': 'North Beverage Stall',
  'concession-s1': 'South Food Court 1',
  'concession-s2': 'South Food Court 2',
  'medical-bay': 'Medical Bay',
  'vip-lounge': 'VIP Lounge',
};

function getStatus(current: number, capacity: number): 'clear' | 'moderate' | 'busy' | 'critical' {
  const pct = current / capacity;
  if (pct >= 0.9) return 'critical';
  if (pct >= 0.75) return 'busy';
  if (pct >= 0.5) return 'moderate';
  return 'clear';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchState, currentZones } = body;

    const prompt = `You are simulating real-time crowd data for Chinnaswamy Stadium, Bangalore during an IPL match: RCB vs MI.

Current match state:
- Phase: ${matchState.phase}
- Over: ${matchState.over}.${matchState.ball}
- Score: RCB ${matchState.scoreTeam1}/${matchState.wicketsTeam1}
- Tension Index: ${matchState.tensionIndex}/100
- Last event: ${matchState.lastEvent?.description || 'none'}

Current zone occupancy (as % of capacity):
${Object.entries(currentZones).map(([id, zone]: [string, unknown]) => {
  const z = zone as { current: number; capacity: number };
  return `- ${ZONE_NAMES[id as ZoneId] || id}: ${Math.round((z.current / z.capacity) * 100)}%`;
}).join('\n')}

Based on the match phase and tension, predict realistic crowd movement for the NEXT 30 seconds.
Consider: during powerplay fans stay in stands, during drinks breaks concourses fill up, high tension keeps fans seated, wickets cause brief movement.

Respond with ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "zones": {
    "north-stand": { "occupancyPercent": 85, "queueMinutes": 0 },
    "south-stand": { "occupancyPercent": 78, "queueMinutes": 0 },
    "east-stand": { "occupancyPercent": 65, "queueMinutes": 2 },
    "west-stand": { "occupancyPercent": 72, "queueMinutes": 1 },
    "north-concourse": { "occupancyPercent": 25, "queueMinutes": 3 },
    "south-concourse": { "occupancyPercent": 20, "queueMinutes": 2 },
    "gate-a": { "occupancyPercent": 15, "queueMinutes": 2 },
    "gate-b": { "occupancyPercent": 12, "queueMinutes": 4 },
    "gate-c": { "occupancyPercent": 10, "queueMinutes": 1 },
    "gate-d": { "occupancyPercent": 18, "queueMinutes": 2 },
    "concession-n1": { "occupancyPercent": 60, "queueMinutes": 7 },
    "concession-n2": { "occupancyPercent": 45, "queueMinutes": 5 },
    "concession-n3": { "occupancyPercent": 85, "queueMinutes": 8 },
    "concession-s1": { "occupancyPercent": 75, "queueMinutes": 8 },
    "concession-s2": { "occupancyPercent": 30, "queueMinutes": 3 },
    "medical-bay": { "occupancyPercent": 10, "queueMinutes": 0 },
    "vip-lounge": { "occupancyPercent": 60, "queueMinutes": 0 }
  }
}

Make the values realistic and slightly different from current to show movement. Keep stands high during powerplay. Concessions busier during breaks.`;

    const responseText = await generateWithFallback(prompt);

    // Parse Gemini response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 });
    }

    const aiData = JSON.parse(jsonMatch[0]);
    const now = Date.now();

    // Build zone updates
    const zoneUpdates: Record<string, unknown> = {};
    for (const [id, data] of Object.entries(aiData.zones)) {
      const zoneId = id as ZoneId;
      const capacity = ZONE_CAPACITIES[zoneId];
      if (!capacity) continue;
      const d = data as { occupancyPercent: number; queueMinutes: number };
      const current = Math.round((d.occupancyPercent / 100) * capacity);
      zoneUpdates[zoneId] = {
        id: zoneId,
        name: ZONE_NAMES[zoneId],
        capacity,
        current,
        status: getStatus(current, capacity),
        queueMinutes: d.queueMinutes,
        staffDeployed: Math.ceil(current / 1000),
        staffRequired: Math.ceil(current / 800),
        lastUpdated: now,
      };
    }

    // Write to Firebase if configured
    let firebaseWritten = false;
    try {
      const { db, isFirebaseConfigured } = await import('@/lib/firebase');
      if (isFirebaseConfigured && db) {
        const { ref, set } = await import('firebase/database');
        const zonesRef = ref(db, 'arena/chinnaswamy-2026-rcb-mi/zones');
        await set(zonesRef, zoneUpdates);
        firebaseWritten = true;
      }
    } catch (fbError) {
      console.warn('[simulate] Firebase write failed:', fbError);
    }

    return NextResponse.json({
      zones: zoneUpdates,
      firebaseWritten,
      generatedAt: now,
    });

  } catch (error) {
    console.error('[simulate] Error:', error);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}

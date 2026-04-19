'use client';
import { useState, useEffect } from 'react';
import { CrowdPrediction, MatchState, Zone, ZoneId } from '@/types/arena.types';

export function usePrediction(zones: Record<ZoneId, Zone>, matchState: MatchState) {
  const [predictions, setPredictions] = useState<CrowdPrediction[]>([]);

  // Only re-fetch when phase or tension changes
  const phase = matchState.phase;
  const tension = matchState.tensionIndex;

  useEffect(() => {
    let cancelled = false;

    fetch('/api/prediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchState, zones, minutesAhead: 10 }),
    })
      .then(r => r.json())
      .then((data: CrowdPrediction[]) => {
        if (!cancelled) setPredictions(data);
      })
      .catch(async () => {
        // Graceful degradation: run prediction engine client-side as fallback
        console.warn('[usePrediction] API call failed, falling back to client-side prediction engine');
        try {
          const { generatePredictions } = await import('@/lib/prediction-engine');
          const fallback = generatePredictions(zones, matchState, 10);
          if (!cancelled) setPredictions(fallback);
        } catch (e) {
          console.error('[usePrediction] Fallback also failed:', e);
        }
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, tension]); // Only re-run when phase or tension changes

  return predictions;
}

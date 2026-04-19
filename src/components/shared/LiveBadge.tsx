'use client';
import React from 'react';
import PulseRing from './PulseRing';

interface LiveBadgeProps {
  label?: string;
}

export default function LiveBadge({ label = 'LIVE' }: LiveBadgeProps) {
  return (
    <span className="flex items-center gap-1.5" aria-label={label}>
      <PulseRing color="bg-amber-500" size="sm" />
      <span className="text-amber-500 font-bold tracking-wider text-xs uppercase">{label}</span>
    </span>
  );
}

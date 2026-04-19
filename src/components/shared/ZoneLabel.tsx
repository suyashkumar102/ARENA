'use client';
import React from 'react';
import type { ZoneStatus } from '@/types/arena.types';

interface ZoneLabelProps {
  status: ZoneStatus;
  label: string;
}

const statusStyles: Record<ZoneStatus, string> = {
  clear: 'bg-green-500/20 text-green-400 border-green-500/30',
  moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  busy: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ZoneLabel({ status, label }: ZoneLabelProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${statusStyles[status]}`}
      aria-label={`${label}: ${status}`}
    >
      {label}
    </span>
  );
}

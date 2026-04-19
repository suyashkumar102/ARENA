'use client';
import React from 'react';

interface PulseRingProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<NonNullable<PulseRingProps['size']>, string> = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export default function PulseRing({
  color = 'bg-amber-500',
  size = 'sm',
}: PulseRingProps) {
  return (
    <span className="relative flex" aria-hidden="true">
      <span
        className={`animate-ping absolute inline-flex rounded-full opacity-75 ${sizeMap[size]} ${color}`}
      />
      <span
        className={`relative inline-flex rounded-full ${sizeMap[size]} ${color}`}
      />
    </span>
  );
}

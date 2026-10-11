'use client';

import React from 'react';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercent?: boolean;
}

export default function CircularProgress({
  progress,
  size = 36,
  strokeWidth = 3.5,
  className = '',
  showPercent = false,
}: CircularProgressProps) {
  const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform transition-transform"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Track - theme adaptive */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          className="stroke-[color:var(--border)] opacity-60"
        />
        {/* Animated Progress Arc - SawaFlix Primary Red / YouTube download blue/red */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="stroke-[color:var(--primary)] transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      {showPercent && (
        <span className="absolute text-[9px] font-bold tabular-nums text-[color:var(--foreground)]">
          {normalizedProgress}%
        </span>
      )}
    </div>
  );
}

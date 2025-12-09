'use client';

import { Plan } from '@ppa/interfaces';

interface PracticeBlockProps {
  plan: Plan;
  onClick: (plan: Plan) => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function PracticeBlock({ plan, onClick }: PracticeBlockProps) {
  return (
    <button
      onClick={() => onClick(plan)}
      className="w-full text-left p-2 rounded-md bg-primary-50 border-l-4 border-primary-500 hover:bg-primary-100 transition-colors cursor-pointer"
    >
      <div className="text-xs font-medium text-gray-700">
        {formatTime(plan.startTime)}
      </div>
      <div className="text-sm font-medium text-gray-900 truncate">
        Practice
      </div>
      <div className="text-xs text-gray-500">
        {formatDuration(plan.duration)}
      </div>
    </button>
  );
}

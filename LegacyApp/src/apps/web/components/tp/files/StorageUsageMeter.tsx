'use client';

import { formatStorageSize } from '@ppa/subscription';

interface StorageUsageMeterProps {
  usedBytes: number;
  limitBytes: number;
  className?: string;
}

export function StorageUsageMeter({ usedBytes, limitBytes, className = '' }: StorageUsageMeterProps) {
  const percentUsed = limitBytes > 0 ? Math.min(100, (usedBytes / limitBytes) * 100) : 0;
  const isWarning = percentUsed >= 80;
  const isCritical = percentUsed >= 95;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 min-w-[100px] max-w-[200px]">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCritical
                ? 'bg-red-500'
                : isWarning
                ? 'bg-yellow-500'
                : 'bg-[#356793]'
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>
      <span className={`text-xs whitespace-nowrap ${isCritical ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
        {formatStorageSize(usedBytes)} / {formatStorageSize(limitBytes)}
      </span>
    </div>
  );
}

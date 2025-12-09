'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface CalendarSkeletonProps {
  viewMode: 'week' | 'month';
}

export function CalendarSkeleton({ viewMode }: CalendarSkeletonProps) {
  if (viewMode === 'week') {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Skeleton className="w-8 h-8 rounded-md" />
              <Skeleton className="w-32 h-6 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-md" />
            </div>
            <Skeleton className="w-32 h-9 rounded-lg" />
          </div>
          <Skeleton className="w-20 h-9 rounded-md" />
        </div>

        {/* Week Grid Skeleton */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white min-h-[200px] flex flex-col">
              <div className="px-3 py-2 text-center border-b bg-gray-50">
                <Skeleton className="w-8 h-4 mx-auto mb-1" />
                <Skeleton className="w-6 h-6 mx-auto" />
              </div>
              <div className="flex-1 p-2 space-y-2">
                {i % 2 === 0 && (
                  <>
                    <Skeleton className="w-full h-16 rounded-md" />
                    {i === 0 && <Skeleton className="w-full h-16 rounded-md" />}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Month View Skeleton
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-32 h-6 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
          </div>
          <Skeleton className="w-32 h-9 rounded-lg" />
        </div>
        <Skeleton className="w-20 h-9 rounded-md" />
      </div>

      {/* Month Grid Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="py-2 flex justify-center">
              <Skeleton className="w-8 h-4" />
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="h-24 p-2 border-b border-r border-gray-100"
            >
              <Skeleton className="w-6 h-6 mb-2" />
              {i % 5 === 0 && <Skeleton className="w-16 h-5 rounded-full" />}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Panel Skeleton */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <Skeleton className="w-48 h-6 mb-4" />
        <div className="space-y-3">
          <Skeleton className="w-full h-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

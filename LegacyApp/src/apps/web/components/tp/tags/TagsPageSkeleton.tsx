'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function TagsPageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and button skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#356793] to-[#2d5578] px-4 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-8 bg-white/20" />
            <Skeleton className="h-4 flex-1 bg-white/20" />
            <Skeleton className="h-4 w-16 bg-white/20" />
          </div>
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 flex-1 max-w-xs" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

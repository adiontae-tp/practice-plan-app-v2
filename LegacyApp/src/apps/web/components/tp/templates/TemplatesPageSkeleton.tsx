'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function TemplatesPageSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-5 w-8" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Table skeleton */}
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#356793] to-[#2d5578] px-4 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 flex-1 max-w-xs bg-white/20" />
            <Skeleton className="h-4 w-20 bg-white/20" />
            <Skeleton className="h-4 w-20 bg-white/20" />
            <Skeleton className="h-4 w-16 bg-white/20" />
          </div>
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 flex-1 max-w-xs" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

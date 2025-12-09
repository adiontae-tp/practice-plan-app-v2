'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ReportsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-7 w-12 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#356793] to-[#2d5578] px-4 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 flex-1 max-w-xs bg-white/20" />
            <Skeleton className="h-4 w-20 bg-white/20" />
            <Skeleton className="h-4 w-24 bg-white/20" />
            <Skeleton className="h-4 w-32 bg-white/20" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 flex-1 max-w-xs" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <div className="flex items-center gap-2 w-48">
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

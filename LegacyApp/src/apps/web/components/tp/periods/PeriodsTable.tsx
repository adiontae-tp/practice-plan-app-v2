'use client';

import { Period } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { X, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface PeriodsDesktopTableProps {
  periods: Period[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick: (period: Period) => void;
  onDelete: (period: Period) => void;
  onAdd: () => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * PeriodsDesktopTable - Desktop table view for periods
 *
 * Uses shadcn components for desktop experience
 */
export function PeriodsDesktopTable({
  periods,
  totalCount,
  searchQuery,
  onSearchChange,
  onRowClick,
  onDelete,
  onAdd,
}: PeriodsDesktopTableProps) {
  // Get tags from store
  const tags = useAppStore((state) => state.tags);
  const isEmpty = periods.length === 0;

  const getTagName = (tagId: string): string => {
    const tag = tags.find((t) => t.id === tagId);
    return tag?.name || tagId;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Periods</h2>
          <span className="text-sm text-gray-500">({totalCount})</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search periods..."
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button
            onClick={onAdd}
            className="bg-[#356793] hover:bg-[#2a5275]"
            data-testid="add-period"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Period
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-[#356793] to-[#2d5578]">
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white">Name</th>
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white w-28">Duration</th>
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white">Tags</th>
            <th className="w-20 px-5 py-3.5 text-center text-sm font-bold text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={4} className="px-5 py-12 text-center text-gray-500">
                {searchQuery ? `No periods found matching "${searchQuery}"` : 'No periods yet'}
              </td>
            </tr>
          ) : (
            periods.map((period) => (
              <tr
                key={period.id}
                onClick={() => onRowClick(period)}
                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-4 text-sm text-gray-900">{period.name}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{formatDuration(period.duration)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {!period.tags || period.tags.length === 0 ? (
                      <span className="text-sm text-gray-400">—</span>
                    ) : (
                      period.tags.slice(0, 3).map((tagId) => (
                        <span
                          key={tagId}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {getTagName(tagId)}
                        </span>
                      ))
                    )}
                    {period.tags && period.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        +{period.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(period);
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Legacy export for backwards compatibility
export { PeriodsDesktopTable as PeriodsTable };

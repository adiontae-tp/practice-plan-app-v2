'use client';

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CalendarViewMode = 'week' | 'month';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onNewPractice: () => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPreviousPeriod,
  onNextPeriod,
  onViewModeChange,
  onNewPractice,
}: CalendarHeaderProps) {
  const formatDateLabel = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };
    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onPreviousPeriod}
            aria-label={`Previous ${viewMode}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-lg font-semibold text-gray-900 min-w-[160px] text-center">
            {formatDateLabel()}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onNextPeriod}
            aria-label={`Next ${viewMode}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => onViewModeChange('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'week'
                ? 'bg-[#356793] text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => onViewModeChange('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'month'
                ? 'bg-[#356793] text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* New Practice Button */}
      <Button onClick={onNewPractice} className="bg-[#356793] hover:bg-[#2a5275]">
        <Plus className="w-4 h-4" />
        New
      </Button>
    </div>
  );
}

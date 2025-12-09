'use client';

import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarEmptyStateProps {
  viewMode: 'week' | 'month';
  onCreatePractice: () => void;
}

export function CalendarEmptyState({ viewMode, onCreatePractice }: CalendarEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-gray-200">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No practices scheduled
      </h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        {viewMode === 'week'
          ? "You don't have any practices scheduled for this week."
          : "You don't have any practices scheduled for this month."}
      </p>
      <Button onClick={onCreatePractice} className="bg-[#356793] hover:bg-[#2a5275]">
        <Plus className="w-4 h-4 mr-1" />
        Create Practice
      </Button>
    </div>
  );
}

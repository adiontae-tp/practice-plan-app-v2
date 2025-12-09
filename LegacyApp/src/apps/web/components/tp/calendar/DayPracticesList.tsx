'use client';

import { Plan } from '@ppa/interfaces';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PracticeCard } from './PracticeCard';

interface DayPracticesListProps {
  date: Date;
  plans: Plan[];
  isLoading: boolean;
  onViewDetails: (plan: Plan) => void;
  onEdit: (plan: Plan) => void;
  onViewPdf: (plan: Plan) => void;
  onShare: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onAddPractice: () => void;
}

function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function DayPracticesListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-4 w-40 mb-2" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-14 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAddPractice }: { onAddPractice: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Calendar className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-gray-500 text-center mb-4">No practices scheduled</p>
      <Button onClick={onAddPractice} className="bg-[#356793] hover:bg-[#2a5275]">
        <Plus className="w-4 h-4 mr-1" />
        Add Practice
      </Button>
    </div>
  );
}

export function DayPracticesList({
  date,
  plans,
  isLoading,
  onViewDetails,
  onEdit,
  onViewPdf,
  onShare,
  onDelete,
  onAddPractice,
}: DayPracticesListProps) {
  // Sort plans by start time
  const sortedPlans = [...plans].sort((a, b) => a.startTime - b.startTime);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Practices
            </h3>
            <p className="text-base font-semibold text-gray-900 mt-0.5">
              {formatDateHeader(date)}
            </p>
          </div>
          {plans.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddPractice}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <DayPracticesListSkeleton />
        ) : sortedPlans.length === 0 ? (
          <EmptyState onAddPractice={onAddPractice} />
        ) : (
          <div className="space-y-3">
            {sortedPlans.map((plan) => (
              <PracticeCard
                key={plan.id}
                plan={plan}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onViewPdf={onViewPdf}
                onShare={onShare}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

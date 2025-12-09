'use client';

import { Plan } from '@ppa/interfaces';
import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PracticeCard } from './PracticeCard';

interface WeekPracticesListProps {
  selectedDate: Date;
  plans: Plan[];
  isLoading: boolean;
  onViewDetails: (plan: Plan) => void;
  onEdit: (plan: Plan) => void;
  onViewPdf: (plan: Plan) => void;
  onShare: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onAddPractice: () => void;
  onDateSelect: (date: Date) => void;
}

function getWeekDays(date: Date): Date[] {
  const days: Date[] = [];
  const d = new Date(date);
  const dayOfWeek = d.getDay();

  // Start from Sunday
  d.setDate(d.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function formatWeekRange(date: Date): string {
  const weekDays = getWeekDays(date);
  const start = weekDays[0];
  const end = weekDays[6];

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
  } else if (start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  } else {
    return `${startMonth} ${start.getDate()}, ${start.getFullYear()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  }
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getPlansForDay(plans: Plan[], date: Date): Plan[] {
  // Use a Map to ensure unique plans by ID (in case of duplicates in source data)
  const uniquePlansMap = new Map<string, Plan>();
  
  plans
    .filter((plan) => {
      const planDate = new Date(plan.startTime);
      return isSameDay(planDate, date);
    })
    .forEach((plan) => {
      // If duplicate ID exists, keep the first one
      if (!uniquePlansMap.has(plan.id)) {
        uniquePlansMap.set(plan.id, plan);
      }
    });
  
  // Convert back to array and sort
  return Array.from(uniquePlansMap.values()).sort((a, b) => a.startTime - b.startTime);
}

function WeekPracticesListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
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
      <p className="text-gray-500 text-center mb-4">No practices scheduled this week</p>
      <Button onClick={onAddPractice} className="bg-[#356793] hover:bg-[#2a5275]">
        <Plus className="w-4 h-4 mr-1" />
        Add Practice
      </Button>
    </div>
  );
}

export function WeekPracticesList({
  selectedDate,
  plans,
  isLoading,
  onViewDetails,
  onEdit,
  onViewPdf,
  onShare,
  onDelete,
  onAddPractice,
  onDateSelect,
}: WeekPracticesListProps) {
  const weekDays = getWeekDays(selectedDate);

  // Get all plans for the week
  const weekPlans = plans.filter((plan) => {
    const planDate = new Date(plan.startTime);
    return weekDays.some((day) => isSameDay(planDate, day));
  });

  // Group plans by day
  const plansByDay = weekDays.map((day) => ({
    date: day,
    plans: getPlansForDay(plans, day),
  }));

  // Navigate week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    onDateSelect(newDate);
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 h-full flex flex-col overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-200 bg-white rounded-t-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigateWeek('prev')}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Week View
              </h3>
              <p className="text-sm font-semibold text-gray-900">
                {formatWeekRange(selectedDate)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigateWeek('next')}
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddPractice}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <WeekPracticesListSkeleton />
        ) : weekPlans.length === 0 ? (
          <EmptyState onAddPractice={onAddPractice} />
        ) : (
          <div className="space-y-5">
            {plansByDay.map(({ date, plans: dayPlans }) => {
              if (dayPlans.length === 0) return null;

              const today = isToday(date);
              const isSelected = isSameDay(date, selectedDate);

              return (
                <div key={date.toISOString()}>
                  {/* Day Header */}
                  <button
                    onClick={() => onDateSelect(date)}
                    className={`
                      text-xs font-semibold mb-2 px-2.5 py-1 rounded-md transition-colors
                      ${today ? 'bg-[#356793] text-white' : ''}
                      ${isSelected && !today ? 'bg-[#356793]/10 text-[#356793]' : ''}
                      ${!today && !isSelected ? 'text-gray-700 hover:bg-gray-100' : ''}
                    `}
                  >
                    {formatDayHeader(date)}
                    {today && <span className="ml-1.5 text-xs font-normal opacity-90">Today</span>}
                  </button>

                  {/* Practices for this day */}
                  <div className="space-y-2">
                    {dayPlans.map((plan) => (
                      <PracticeCard
                        key={plan.id}
                        plan={plan}
                        onViewDetails={onViewDetails}
                        onEdit={onEdit}
                        onViewPdf={onViewPdf}
                        onShare={onShare}
                        onDelete={onDelete}
                        compact
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

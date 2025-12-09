'use client';

import { Plan } from '@ppa/interfaces';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompactMonthCalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  plans: Plan[];
  onDateSelect: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getMonthDays(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const days: (Date | null)[] = [];

  // Add empty cells for days before the first of the month
  const startDay = firstDayOfMonth.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    days.push(new Date(year, month, day));
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

function getPracticeCountForDay(plans: Plan[], date: Date): number {
  return plans.filter((plan) => {
    const planDate = new Date(plan.startTime);
    return isSameDay(planDate, date);
  }).length;
}

export function CompactMonthCalendar({
  currentMonth,
  selectedDate,
  plans,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
}: CompactMonthCalendarProps) {
  const monthDays = getMonthDays(currentMonth);
  const monthLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Month Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-base font-semibold text-gray-900">{monthLabel}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAY_HEADERS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7">
        {monthDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="h-10 border-b border-r border-gray-50"
              />
            );
          }

          const practiceCount = getPracticeCountForDay(plans, day);
          const today = isToday(day);
          const isSelected = isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`h-10 flex flex-col items-center justify-center border-b border-r border-gray-50 transition-colors hover:bg-gray-50 relative ${
                isSelected ? 'bg-blue-50' : ''
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  today
                    ? 'w-6 h-6 rounded-full bg-[#356793] text-white flex items-center justify-center'
                    : isSelected
                    ? 'text-[#356793] font-semibold'
                    : 'text-gray-700'
                }`}
              >
                {day.getDate()}
              </span>
              {practiceCount > 0 && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#356793]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { Plan } from '@ppa/interfaces';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullMonthCalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  plans: Plan[];
  onDateSelect: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onPlanClick?: (plan: Plan) => void;
  onGoToToday?: () => void;
}

function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

function getRowCount(days: (Date | null)[]): number {
  return Math.ceil(days.length / 7);
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

function isSameWeek(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Get the start of week (Sunday) for both dates
  const startOfWeek1 = new Date(d1);
  startOfWeek1.setDate(d1.getDate() - d1.getDay());
  startOfWeek1.setHours(0, 0, 0, 0);

  const startOfWeek2 = new Date(d2);
  startOfWeek2.setDate(d2.getDate() - d2.getDay());
  startOfWeek2.setHours(0, 0, 0, 0);

  return startOfWeek1.getTime() === startOfWeek2.getTime();
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

function formatTimeShort(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'p' : 'a';
  const hour12 = hours % 12 || 12;
  if (minutes === 0) {
    return `${hour12}${ampm}`;
  }
  return `${hour12}:${String(minutes).padStart(2, '0')}${ampm}`;
}

function formatTimeRange(startTime: number, endTime: number): string {
  return `${formatTimeShort(startTime)}-${formatTimeShort(endTime)}`;
}

export function FullMonthCalendar({
  currentMonth,
  selectedDate,
  plans,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onPlanClick,
  onGoToToday,
}: FullMonthCalendarProps) {
  const monthDays = getMonthDays(currentMonth);
  const monthLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const rows = getRowCount(monthDays);
  const today = new Date();
  const isViewingCurrentMonth = isSameMonth(currentMonth, today);

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full shadow-sm">
      {/* Month Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-900">{monthLabel}</span>
          {!isViewingCurrentMonth && onGoToToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={onGoToToday}
              className="text-xs h-7 px-3"
            >
              Today
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 shrink-0 bg-gray-50">
        {WEEKDAY_HEADERS.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid - fills remaining space */}
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {monthDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="border-b border-r border-gray-100 bg-gray-50/50"
              />
            );
          }

          const dayPlans = getPlansForDay(plans, day);
          const today = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          const isInSelectedWeek = isSameWeek(day, selectedDate);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`
                flex flex-col items-start justify-start border-b border-r border-gray-100
                transition-colors relative p-2 overflow-hidden cursor-pointer
                ${today ? 'bg-blue-50/70' : ''}
                ${isInSelectedWeek && !isSelected && !today ? 'bg-blue-50/30' : ''}
                ${isSelected ? 'bg-[#356793]/10' : ''}
                ${!isCurrentMonth ? 'opacity-40' : ''}
                hover:bg-gray-50
              `}
            >
              {/* Day number in top-left */}
              <span
                className={`
                  text-sm font-medium shrink-0 mb-1
                  ${today ? 'bg-[#356793] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}
                  ${isSelected && !today ? 'text-[#356793] font-semibold' : ''}
                  ${!isSelected && !today ? 'text-gray-700' : ''}
                `}
              >
                {day.getDate()}
              </span>
              {/* Practice times - clickable */}
              {dayPlans.length > 0 && (
                <div className="flex flex-col gap-1 mt-0.5 w-full overflow-hidden">
                  {dayPlans.slice(0, 2).map((plan, planIndex) => (
                    <button
                      key={`${plan.id}-${planIndex}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlanClick?.(plan);
                      }}
                      className="text-[11px] leading-tight text-[#356793] font-medium truncate text-left hover:underline px-1.5 py-0.5 bg-[#356793]/10 rounded"
                    >
                      {formatTimeRange(plan.startTime, plan.endTime)}
                    </button>
                  ))}
                  {dayPlans.length > 2 && (
                    <span className="text-[10px] leading-tight text-gray-400 px-1.5">
                      +{dayPlans.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

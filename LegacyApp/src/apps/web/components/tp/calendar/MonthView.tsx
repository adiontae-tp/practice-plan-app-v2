'use client';

import { Plan } from '@ppa/interfaces';
import { SelectedDayPanel } from './SelectedDayPanel';

interface MonthViewProps {
  currentDate: Date;
  plans: Plan[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onPlanClick: (plan: Plan) => void;
  onCreatePractice: (date: Date) => void;
}

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

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthView({
  currentDate,
  plans,
  selectedDate,
  onDateSelect,
  onPlanClick,
  onCreatePractice,
}: MonthViewProps) {
  const monthDays = getMonthDays(currentDate);
  const selectedDayPlans = selectedDate ? getPlansForDay(plans, selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {WEEKDAY_HEADERS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-gray-600"
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
                  className="h-24 bg-gray-50 border-b border-r border-gray-100"
                />
              );
            }

            const dayPlans = getPlansForDay(plans, day);
            const today = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                onDoubleClick={() => onCreatePractice(day)}
                className={`h-24 p-2 border-b border-r border-gray-100 text-left transition-colors hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center text-sm font-medium ${
                      today
                        ? 'w-7 h-7 rounded-full bg-[#356793] text-white'
                        : isSelected
                        ? 'text-[#356793] font-semibold'
                        : 'text-gray-900'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {/* Practice Count Badge */}
                {dayPlans.length > 0 && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                      {dayPlans.length} practice{dayPlans.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Panel */}
      {selectedDate && (
        <SelectedDayPanel
          date={selectedDate}
          plans={selectedDayPlans}
          onPlanClick={onPlanClick}
          onCreatePractice={() => onCreatePractice(selectedDate)}
        />
      )}
    </div>
  );
}

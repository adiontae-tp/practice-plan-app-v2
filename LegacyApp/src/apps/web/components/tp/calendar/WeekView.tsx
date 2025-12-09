'use client';

import { Plan } from '@ppa/interfaces';
import { PracticeBlock } from './PracticeBlock';
import { CalendarEmptyState } from './CalendarEmptyState';

interface WeekViewProps {
  currentDate: Date;
  plans: Plan[];
  onPlanClick: (plan: Plan) => void;
  onCreatePractice: (date: Date) => void;
}

function getWeekDays(date: Date): Date[] {
  const days: Date[] = [];
  const startOfWeek = new Date(date);
  const dayOfWeek = startOfWeek.getDay();
  // Adjust to start from Monday
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(startOfWeek.getDate() + diff);

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
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

export function WeekView({
  currentDate,
  plans,
  onPlanClick,
  onCreatePractice,
}: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);
  const weekPlans = plans.filter((plan) => {
    const planDate = new Date(plan.startTime);
    return weekDays.some((day) => isSameDay(planDate, day));
  });

  if (weekPlans.length === 0) {
    return (
      <CalendarEmptyState
        viewMode="week"
        onCreatePractice={() => onCreatePractice(new Date())}
      />
    );
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
      {weekDays.map((day) => {
        const dayPlans = getPlansForDay(plans, day);
        const today = isToday(day);
        const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = day.getDate();

        return (
          <div
            key={day.toISOString()}
            className="bg-white min-h-[200px] flex flex-col"
          >
            {/* Day Header */}
            <div
              className={`px-3 py-2 text-center border-b ${
                today ? 'bg-[#356793]' : 'bg-gray-50'
              }`}
            >
              <div
                className={`text-xs font-medium ${
                  today ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {dayOfWeek}
              </div>
              <div
                className={`text-lg font-semibold ${
                  today ? 'text-white' : 'text-gray-900'
                }`}
              >
                {dayNumber}
              </div>
            </div>

            {/* Day Content */}
            <div
              className="flex-1 p-2 space-y-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => dayPlans.length === 0 && onCreatePractice(day)}
            >
              {dayPlans.map((plan) => (
                <PracticeBlock key={plan.id} plan={plan} onClick={onPlanClick} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

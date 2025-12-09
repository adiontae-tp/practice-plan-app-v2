import { Plan } from '@ppa/interfaces';

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
}

export function formatWeekRange(weekStart: Date): string {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);

  const startDay = formatDayAbbreviation(start);
  const startDate = start.getDate();
  const endDay = formatDayAbbreviation(end);
  const endDate = end.getDate();
  const month = end.toLocaleDateString('en-US', { month: 'short' });

  return `${startDay} ${startDate} - ${endDay} ${endDate} ${month}`;
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

export function formatDayAbbreviation(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDateNumber(date: Date): string {
  return date.getDate().toString();
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSameWeek(date: Date, weekStart: Date): boolean {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const dateTime = date.getTime();
  const weekStartTime = weekStart.getTime();
  const weekEndTime = weekEnd.getTime();

  return dateTime >= weekStartTime && dateTime <= weekEndTime;
}

export function getPracticeCountForDay(plans: Plan[], date: Date): number {
  return plans.filter((plan) => isSameDay(new Date(plan.startTime), date)).length;
}

export function getPlansForWeek(plans: Plan[], weekStart: Date): Plan[] {
  return plans
    .filter((plan) => isSameWeek(new Date(plan.startTime), weekStart))
    .sort((a, b) => a.startTime - b.startTime);
}

export function groupPlansByDate(plans: Plan[]): Record<string, Plan[]> {
  const grouped: Record<string, Plan[]> = {};

  plans.forEach((plan) => {
    const date = new Date(plan.startTime);
    const dateKey = date.toISOString().split('T')[0];

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(plan);
  });

  return grouped;
}

export function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

import { StateCreator } from 'zustand';
import { Plan } from '@ppa/interfaces';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

function getMonday(date: Date): number {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export type CalendarViewMode = 'week' | 'month';

export interface CalendarUISlice {
  calendarSelectedDate: Date;
  calendarCurrentMonth: Date;
  calendarCurrentWeekStart: number;
  calendarViewMode: CalendarViewMode;
  calendarShowNewModal: boolean;
  calendarShowDetailModal: boolean;
  calendarShowDeleteAlert: boolean;
  calendarSelectedPlan: Plan | null;
  calendarIsLoading: boolean;

  setCalendarSelectedDate: (date: Date) => void;
  setCalendarCurrentMonth: (date: Date) => void;
  setCalendarCurrentWeekStart: (timestamp: number) => void;
  setCalendarViewMode: (mode: CalendarViewMode) => void;
  setCalendarShowNewModal: (show: boolean) => void;
  setCalendarShowDetailModal: (show: boolean) => void;
  setCalendarShowDeleteAlert: (show: boolean) => void;
  setCalendarSelectedPlan: (plan: Plan | null) => void;
  setCalendarIsLoading: (loading: boolean) => void;
  calendarNavigateMonth: (direction: 'prev' | 'next') => void;
  calendarNavigateWeek: (direction: 'prev' | 'next') => void;
  calendarGoToCurrentWeek: () => void;
  resetCalendarUI: () => void;
}

const initialState = {
  calendarSelectedDate: new Date(),
  calendarCurrentMonth: new Date(),
  calendarCurrentWeekStart: getMonday(new Date()),
  calendarViewMode: 'week' as CalendarViewMode,
  calendarShowNewModal: false,
  calendarShowDetailModal: false,
  calendarShowDeleteAlert: false,
  calendarSelectedPlan: null as Plan | null,
  calendarIsLoading: false,
};

export const createCalendarUISlice: StateCreator<CalendarUISlice> = (set, get) => ({
  ...initialState,

  setCalendarSelectedDate: (date) => set({ calendarSelectedDate: date }),
  setCalendarCurrentMonth: (date) => set({ calendarCurrentMonth: date }),
  setCalendarCurrentWeekStart: (timestamp) => set({ calendarCurrentWeekStart: timestamp }),
  setCalendarViewMode: (mode) => set({ calendarViewMode: mode }),
  setCalendarShowNewModal: (show) => set({ calendarShowNewModal: show }),
  setCalendarShowDetailModal: (show) => set({ calendarShowDetailModal: show }),
  setCalendarShowDeleteAlert: (show) => set({ calendarShowDeleteAlert: show }),
  setCalendarSelectedPlan: (plan) => set({ calendarSelectedPlan: plan }),
  setCalendarIsLoading: (loading) => set({ calendarIsLoading: loading }),

  calendarNavigateMonth: (direction) => {
    const current = get().calendarCurrentMonth;
    const newMonth = new Date(current);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    set({ calendarCurrentMonth: newMonth });
  },

  calendarNavigateWeek: (direction) => {
    const current = get().calendarCurrentWeekStart;
    const newWeekStart = direction === 'prev' ? current - WEEK_IN_MS : current + WEEK_IN_MS;
    set({ calendarCurrentWeekStart: newWeekStart });
  },

  calendarGoToCurrentWeek: () => {
    set({ calendarCurrentWeekStart: getMonday(new Date()) });
  },

  resetCalendarUI: () => set({
    calendarSelectedDate: new Date(),
    calendarCurrentMonth: new Date(),
    calendarCurrentWeekStart: getMonday(new Date()),
    calendarViewMode: 'week',
    calendarShowNewModal: false,
    calendarShowDetailModal: false,
    calendarShowDeleteAlert: false,
    calendarSelectedPlan: null,
    calendarIsLoading: false,
  }),
});

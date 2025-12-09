'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PlanNewModalProps {
  open: boolean;
  initialDate: Date;
  onClose: () => void;
  onSave: (data: { date: Date; startTime: string }) => void;
}

const WEEKDAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getMonthDays(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  const startDay = firstDayOfMonth.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

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

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PlanNewModal({
  open,
  initialDate,
  onClose,
  onSave,
}: PlanNewModalProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewingMonth, setViewingMonth] = useState(initialDate);
  const [startTime, setStartTime] = useState('14:00');
  const [isSaving, setIsSaving] = useState(false);

  // Sync selectedDate with initialDate when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDate(initialDate);
      setViewingMonth(initialDate);
    }
  }, [open, initialDate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        date: selectedDate,
        startTime,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(viewingMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'prev' ? -1 : 1));
    setViewingMonth(newMonth);
  };

  const monthDays = getMonthDays(viewingMonth);
  const monthLabel = viewingMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <style>{`
        /* Style the native time picker dropdown with brand blue */
        #start-time::-webkit-calendar-picker-indicator {
          background-color: #356793;
          color: white;
          cursor: pointer;
          border-radius: 4px;
          padding: 2px;
        }
        
        #start-time::-webkit-calendar-picker-indicator:hover {
          background-color: #2a5275;
        }
        
        /* Firefox time picker styling */
        #start-time::-moz-calendar-picker-indicator {
          background-color: #356793;
          color: white;
          cursor: pointer;
          border-radius: 4px;
        }
        
        /* Style the time picker input fields */
        #start-time::-webkit-datetime-edit {
          color: #262627;
        }
        
        #start-time::-webkit-datetime-edit-fields-wrapper {
          color: #262627;
        }
        
        #start-time::-webkit-datetime-edit-text {
          color: #737373;
        }
        
        #start-time::-webkit-datetime-edit-hour-field:focus,
        #start-time::-webkit-datetime-edit-minute-field:focus {
          background-color: rgba(53, 103, 147, 0.1);
          color: #356793;
          outline: 2px solid #356793;
          outline-offset: 1px;
        }
      `}</style>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            New Practice Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Mini Calendar */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4" />
              Select Date
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => navigateMonth('next')}
                  className="h-7 w-7"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {WEEKDAY_HEADERS.map((day) => (
                  <div
                    key={day}
                    className="py-1.5 text-center text-xs font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7">
                {monthDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-9" />;
                  }

                  const today = isToday(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = day.getMonth() === viewingMonth.getMonth();

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={`
                        h-9 flex items-center justify-center text-sm transition-colors
                        ${today && !isSelected ? 'font-semibold text-[#356793]' : ''}
                        ${isSelected ? 'bg-[#356793] text-white rounded-full mx-1' : ''}
                        ${!isSelected && !today ? 'text-gray-700 hover:bg-gray-100' : ''}
                        ${!isCurrentMonth ? 'opacity-40' : ''}
                      `}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center font-medium">
              {formatDateDisplay(selectedDate)}
            </p>
          </div>

          {/* Time Selection */}
          <div>
            <label htmlFor="start-time" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-600" />
              Start Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="pl-10 h-11 text-base font-medium text-gray-900 bg-white border-gray-300 hover:border-gray-400 transition-colors focus-visible:border-[#356793] focus-visible:ring-[#356793]/20 focus-visible:ring-2"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              End time will be calculated based on the periods you add
            </p>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#356793] hover:bg-[#2a5275]"
            data-testid="save-plan"
          >
            {isSaving ? 'Creating...' : 'Create Practice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

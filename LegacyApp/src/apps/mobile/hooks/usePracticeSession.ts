import { useState, useEffect, useMemo } from 'react';
import { Plan } from '@ppa/interfaces';
// mobile file change test 2
export interface PracticeSessionState {
  isActive: boolean;
  currentActivityIndex: number | null;
  timeRemaining: number; // seconds remaining in current activity
  elapsedTime: number; // seconds elapsed in current activity
  totalElapsed: number; // total seconds elapsed in practice
  progress: number; // 0-1 progress through current activity
}

export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDurationShort(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function usePracticeSession(plan: Plan | null): PracticeSessionState {
  const [now, setNow] = useState(Date.now());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!plan) {
      return {
        isActive: false,
        currentActivityIndex: null,
        timeRemaining: 0,
        elapsedTime: 0,
        totalElapsed: 0,
        progress: 0,
      };
    }

    const { startTime, endTime, activities } = plan;

    // Check if practice is active
    const isActive = now >= startTime && now <= endTime;

    if (!isActive) {
      return {
        isActive: false,
        currentActivityIndex: null,
        timeRemaining: 0,
        elapsedTime: 0,
        totalElapsed: 0,
        progress: 0,
      };
    }

    // Calculate total elapsed time
    const totalElapsed = Math.floor((now - startTime) / 1000);

    // Find current activity
    let currentActivityIndex: number | null = null;
    let activityStartTime = startTime;
    let timeRemaining = 0;
    let elapsedTime = 0;
    let progress = 0;

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const activityDurationMs = activity.duration * 60 * 1000;
      const activityEndTime = activityStartTime + activityDurationMs;

      if (now >= activityStartTime && now < activityEndTime) {
        currentActivityIndex = i;
        elapsedTime = Math.floor((now - activityStartTime) / 1000);
        timeRemaining = Math.floor((activityEndTime - now) / 1000);
        progress = elapsedTime / (activity.duration * 60);
        break;
      }

      activityStartTime = activityEndTime;
    }

    return {
      isActive,
      currentActivityIndex,
      timeRemaining,
      elapsedTime,
      totalElapsed,
      progress,
    };
  }, [plan, now]);
}

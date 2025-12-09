'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@ppa/store';
import { useMobileWeb, MWPageContent, MWList, MWListItem } from '@ppa/mobile-web';
import { Plan } from '@ppa/interfaces';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Calendar,
} from 'lucide-react';

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function PracticePage() {
  const router = useRouter();
  const { isMobile } = useMobileWeb();
  const plans = useAppStore((state) => state.plans);

  // On desktop, redirect to dashboard
  if (!isMobile) {
    router.replace('/dashboard');
    return null;
  }

  // Get upcoming plans (next 7 days)
  const upcomingPlans = useMemo(() => {
    const now = Date.now();
    const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;

    return plans
      .filter((plan) => plan.startTime >= now && plan.startTime <= weekFromNow)
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, 5);
  }, [plans]);

  // Get today's plans
  const todaysPlans = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return plans.filter(
      (plan) => plan.startTime >= today.getTime() && plan.startTime < tomorrow.getTime()
    );
  }, [plans]);

  return (
    <MWPageContent padding="none">
      <div className="flex flex-col">
        {/* New Practice Plan Button */}
        <div className="px-4 pt-4 pb-6">
          <Button
            onClick={() => router.push('/plan/new')}
            className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-base font-semibold rounded-xl shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Practice Plan
          </Button>
        </div>

        {/* Today's Plans Section */}
        <div className="flex flex-col">
          {/* TODAY Header - Full width gray bar */}
          <div className="bg-gray-100 px-4 py-2.5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              TODAY
            </h2>
          </div>

          {/* Today's Content */}
          <div className="bg-white">
            {todaysPlans.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <div className="flex justify-center mb-4">
                  <Calendar className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
                </div>
                <p className="text-gray-500 text-base mb-4">No practices scheduled for today</p>
                <button
                  onClick={() => router.push('/plan/new')}
                  className="text-blue-600 font-medium text-base"
                >
                  Schedule a practice
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {todaysPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => router.push(`/plan/${plan.id}`)}
                    className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="text-base font-semibold text-gray-900">
                        {formatTime(plan.startTime)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDuration(plan.duration)} · {plan.activities?.length || 0} periods
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Plans */}
        {upcomingPlans.length > 0 && (
          <div className="mt-8 flex flex-col">
            <div className="px-4 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                UPCOMING
              </h2>
              <button
                onClick={() => router.push('/calendar')}
                className="text-sm text-blue-600 font-medium"
              >
                View Calendar
              </button>
            </div>

            <div className="bg-white divide-y divide-gray-100">
              {upcomingPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="text-base font-semibold text-gray-900">
                      {formatTime(plan.startTime)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(plan.startTime)} · {formatDuration(plan.duration)} · {plan.activities?.length || 0} periods
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </MWPageContent>
  );
}


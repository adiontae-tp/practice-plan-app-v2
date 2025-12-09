'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@ppa/store';
import { Plan } from '@ppa/interfaces';
import {
  Calendar,
  Clock,
  Users,
  FileStack,
  Plus,
  ChevronRight,
  Bell,
  ArrowRight,
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

export default function DashboardPage() {
  const router = useRouter();

  // Get data from store
  const plans = useAppStore((state) => state.plans);
  const coaches = useAppStore((state) => state.coaches);
  const templates = useAppStore((state) => state.templates);
  const periods = useAppStore((state) => state.periods);
  const plansLoading = useAppStore((state) => state.plansLoading);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Get today's practices
  const todaysPractices = useMemo(() => {
    return plans
      .filter((plan) => {
        const planDate = new Date(plan.startTime);
        return planDate >= today && planDate < todayEnd;
      })
      .sort((a, b) => a.startTime - b.startTime);
  }, [plans, today, todayEnd]);

  // Get upcoming practices (next 7 days, excluding today)
  const upcomingPractices = useMemo(() => {
    const weekFromNow = new Date(todayEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
    return plans
      .filter((plan) => {
        const planDate = new Date(plan.startTime);
        return planDate >= todayEnd && planDate < weekFromNow;
      })
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, 5);
  }, [plans, todayEnd]);

  // Calculate stats
  const stats = useMemo(() => {
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingCount = plans.filter(
      (plan) => new Date(plan.startTime) >= now && new Date(plan.startTime) < weekFromNow
    ).length;

    const totalMinutesThisMonth = plans
      .filter((plan) => {
        const planDate = new Date(plan.startTime);
        return planDate.getMonth() === now.getMonth() && planDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, plan) => sum + plan.duration, 0);

    const activeCoaches = coaches.filter((c) => c.status === 'active').length;

    return {
      upcomingPractices: upcomingCount,
      totalHours: (totalMinutesThisMonth / 60).toFixed(1),
      activeCoaches,
      totalTemplates: templates.length,
      totalPeriods: periods.length,
    };
  }, [plans, coaches, templates, periods, now]);

  // Show loading state
  if (plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Welcome back! Here&apos;s an overview of your practice planning.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Upcoming Practices"
          value={String(stats.upcomingPractices)}
          subtitle="Next 7 days"
          icon={<Calendar className="w-5 h-5" />}
          href="/calendar"
        />
        <StatCard
          title="Total Hours"
          value={stats.totalHours}
          subtitle="This month"
          icon={<Clock className="w-5 h-5" />}
          href="/calendar"
        />
        <StatCard
          title="Active Coaches"
          value={String(stats.activeCoaches)}
          subtitle="Team members"
          icon={<Users className="w-5 h-5" />}
          href="/coaches"
        />
        <StatCard
          title="Templates"
          value={String(stats.totalTemplates)}
          subtitle={`${stats.totalPeriods} periods available`}
          icon={<FileStack className="w-5 h-5" />}
          href="/templates"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Practice */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Today&apos;s Practice</h2>
            <Link
              href="/calendar"
              className="text-sm text-[#356793] font-medium hover:underline flex items-center gap-1"
            >
              View Calendar
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {todaysPractices.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm md:text-base text-gray-600">No practice scheduled for today</p>
              <Link
                href="/calendar"
                className="mt-4 inline-flex items-center gap-1 text-sm text-[#356793] font-medium hover:underline"
              >
                <Plus className="w-4 h-4" />
                Schedule a practice
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysPractices.map((practice) => (
                <PracticeCard
                  key={practice.id}
                  practice={practice}
                  isToday
                  onClick={() => router.push(`/plan/${practice.id}/edit`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-2">
            <QuickAction
              label="Create Practice Plan"
              href="/calendar"
              icon={<Plus className="w-4 h-4" />}
            />
            <QuickAction
              label="View Calendar"
              href="/calendar"
              icon={<Calendar className="w-4 h-4" />}
            />
            <QuickAction
              label="Manage Templates"
              href="/templates"
              icon={<FileStack className="w-4 h-4" />}
            />
            <QuickAction
              label="Send Announcement"
              href="/announcements"
              icon={<Bell className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Practices */}
      {upcomingPractices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Upcoming Practices</h2>
            <Link
              href="/calendar"
              className="text-sm text-[#356793] font-medium hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {upcomingPractices.map((practice) => (
              <PracticeCard
                key={practice.id}
                practice={practice}
                onClick={() => router.push(`/plan/${practice.id}/edit`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-[#356793] hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#356793] flex items-center justify-center text-white">
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200 hover:border-gray-300"
    >
      <span className="text-gray-400">{icon}</span>
      {label}
    </Link>
  );
}

function PracticeCard({
  practice,
  isToday,
  onClick,
}: {
  practice: Plan;
  isToday?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
        isToday
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {formatTime(practice.startTime)} - {formatTime(practice.endTime)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(practice.startTime)} · {formatDuration(practice.duration)}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
        <Clock className="w-3 h-3" />
        <span>{practice.activities.length} periods</span>
      </div>
    </button>
  );
}

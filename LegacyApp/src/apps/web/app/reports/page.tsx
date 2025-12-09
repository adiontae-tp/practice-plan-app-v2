'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore, ReportTab, DateRange } from '@ppa/store';
import {
  ReportsTabSelector,
  StatCardsRow,
  PeriodUsageTable,
  TagUsageTable,
  DateRangeFilter,
  ReportsPageSkeleton,
} from '@/components/tp/reports';

function getDateRangeStart(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarter':
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      return new Date(now.getFullYear(), quarterMonth, 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    case 'all':
      return new Date(0);
  }
}

export default function ReportsPage() {
  const {
    reportsActiveTab,
    reportsDateRange,
    reportsIsLoading,
    setReportsActiveTab,
    setReportsDateRange,
    setReportsIsLoading,
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

  // Get data from store
  const plans = useAppStore((state) => state.plans);
  const tags = useAppStore((state) => state.tags);
  const plansLoading = useAppStore((state) => state.plansLoading);

  // Simulate initial loading
  useEffect(() => {
    setReportsIsLoading(true);
    const timer = setTimeout(() => {
      setReportsIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [setReportsIsLoading]);

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  // Filter plans by date range
  const filteredPlans = useMemo(() => {
    const rangeStart = getDateRangeStart(reportsDateRange);
    return plans.filter((plan) => new Date(plan.startTime) >= rangeStart);
  }, [reportsDateRange, plans]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalMinutes = filteredPlans.reduce((sum, plan) => sum + plan.duration, 0);
    const allActivities = filteredPlans.flatMap((plan) => plan.activities);
    const uniquePeriodNames = new Set(allActivities.map((a) => a.name));
    const allTagIds = new Set(
      allActivities.flatMap((a) => (a.tags as any[]).map((t) => (typeof t === 'object' ? t.id : t)))
    );

    return {
      totalPractices: filteredPlans.length,
      totalHours: totalMinutes / 60,
      uniquePeriods: uniquePeriodNames.size,
      uniqueTags: allTagIds.size,
    };
  }, [filteredPlans]);

  // Calculate period usage data
  const periodUsageData = useMemo(() => {
    const allActivities = filteredPlans.flatMap((plan) => plan.activities);
    const totalMinutes = allActivities.reduce((sum, a) => sum + a.duration, 0);

    const usageMap = new Map<string, { timesUsed: number; totalMinutes: number }>();

    allActivities.forEach((activity) => {
      const current = usageMap.get(activity.name) || { timesUsed: 0, totalMinutes: 0 };
      usageMap.set(activity.name, {
        timesUsed: current.timesUsed + 1,
        totalMinutes: current.totalMinutes + activity.duration,
      });
    });

    return Array.from(usageMap.entries())
      .map(([name, data]) => ({
        name,
        timesUsed: data.timesUsed,
        totalMinutes: data.totalMinutes,
        percentage: totalMinutes > 0 ? (data.totalMinutes / totalMinutes) * 100 : 0,
      }))
      .sort((a, b) => b.timesUsed - a.timesUsed);
  }, [filteredPlans]);

  // Calculate tag usage data
  const tagUsageData = useMemo(() => {
    const allActivities = filteredPlans.flatMap((plan) => plan.activities);
    const totalActivities = allActivities.length;

    const usageMap = new Map<string, number>();

    allActivities.forEach((activity) => {
      const activityTags = activity.tags as any[];
      activityTags.forEach((tag) => {
        const tagId = typeof tag === 'object' ? tag.id : tag;
        const tagObj = tags.find((t) => t.id === tagId);
        const tagName = tagObj?.name || tagId;
        usageMap.set(tagName, (usageMap.get(tagName) || 0) + 1);
      });
    });

    return Array.from(usageMap.entries())
      .map(([name, timesUsed]) => ({
        name,
        timesUsed,
        percentage: totalActivities > 0 ? (timesUsed / totalActivities) * 100 : 0,
      }))
      .sort((a, b) => b.timesUsed - a.timesUsed);
  }, [filteredPlans, tags]);

  if (reportsIsLoading) {
    return <ReportsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <div className="flex items-center gap-3">
          <ReportsTabSelector activeTab={reportsActiveTab} onTabChange={setReportsActiveTab} />
          <DateRangeFilter value={reportsDateRange} onChange={setReportsDateRange} />
        </div>
      </div>

      {/* Stats Cards */}
      <StatCardsRow
        totalPractices={stats.totalPractices}
        totalHours={stats.totalHours}
        uniquePeriods={stats.uniquePeriods}
        uniqueTags={stats.uniqueTags}
      />

      {/* Usage Table */}
      {reportsActiveTab === 'periods' ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Period Usage Breakdown</h2>
          <PeriodUsageTable data={periodUsageData} />
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tag Usage Breakdown</h2>
          <TagUsageTable data={tagUsageData} />
        </div>
      )}
    </div>
  );
}

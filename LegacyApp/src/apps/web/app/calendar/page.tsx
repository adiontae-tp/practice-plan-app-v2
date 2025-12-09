'use client';

import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plan } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { generateICalEvent, generateICalFilename } from '@ppa/pdf';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FullMonthCalendar,
  WeekPracticesList,
  PlanDetailModal,
  PlanNewModal,
  DeleteConfirmDialog,
  SeriesActionDialog,
  PlanShareModal,
} from '@/components/tp/calendar';
import { PdfTemplateModal } from '@/components/tp/pdf';
import { Skeleton } from '@/components/ui/skeleton';

function CalendarPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 flex-1 min-h-0">
      {/* Calendar Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-8 h-8" />
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 flex-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-full w-full" />
          ))}
        </div>
      </div>

      {/* Week Practices List Skeleton */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 h-full">
        <Skeleton className="w-20 h-3 mb-1" />
        <Skeleton className="w-36 h-4 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="w-16 h-4 mb-1.5" />
              <div className="bg-white rounded-md border px-3 py-2">
                <Skeleton className="w-full h-3 mb-1" />
                <Skeleton className="w-24 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const router = useRouter();

  // Store state - UI slice
  const {
    calendarSelectedDate,
    calendarCurrentMonth,
    calendarShowNewModal,
    calendarShowDetailModal,
    calendarShowDeleteAlert,
    calendarSelectedPlan,
    setCalendarSelectedDate,
    setCalendarCurrentMonth,
    setCalendarShowNewModal,
    setCalendarShowDetailModal,
    setCalendarShowDeleteAlert,
    setCalendarSelectedPlan,
    calendarNavigateMonth,
  } = useAppStore();

  // Store state - Data from Firebase (populated by appSlice subscriptions)
  const plans = useAppStore((state) => state.plans);
  const plansLoading = useAppStore((state) => state.plansLoading);
  const planDeleting = useAppStore((state) => state.planDeleting);
  const team = useAppStore((state) => state.team);
  const user = useAppStore((state) => state.user);
  const isAppLoading = useAppStore((state) => state.isAppLoading);

  // Store actions - CRUD operations
  const createPlan = useAppStore((state) => state.createPlan);
  const deletePlan = useAppStore((state) => state.deletePlan);
  const getPlansInSeries = useAppStore((state) => state.getPlansInSeries);
  const deletePlanSeries = useAppStore((state) => state.deletePlanSeries);

  // PDF modal actions
  const openPdfTemplateModal = useAppStore((state) => state.openPdfTemplateModal);

  // Combined loading state
  const isLoading = isAppLoading || plansLoading;

  // Handlers
  const handleDateSelect = useCallback((date: Date) => {
    setCalendarSelectedDate(date);
    // Also update the month view if the selected date is in a different month
    if (date.getMonth() !== calendarCurrentMonth.getMonth() ||
        date.getFullYear() !== calendarCurrentMonth.getFullYear()) {
      setCalendarCurrentMonth(date);
    }
  }, [setCalendarSelectedDate, setCalendarCurrentMonth, calendarCurrentMonth]);

  const handleNewPractice = useCallback(() => {
    setCalendarShowNewModal(true);
  }, [setCalendarShowNewModal]);

  const handleViewDetails = useCallback((plan: Plan) => {
    setCalendarSelectedPlan(plan);
    setCalendarShowDetailModal(true);
  }, [setCalendarSelectedPlan, setCalendarShowDetailModal]);

  const handleEdit = useCallback((plan: Plan) => {
    // Check if this is part of a series
    if (plan.seriesId) {
      const plansInSeries = getPlansInSeries(plan.seriesId);
      if (plansInSeries.length > 1) {
        // Show series action dialog
        setCalendarSelectedPlan(plan);
        setCalendarShowDetailModal(false);
        setSeriesActionType('edit');
        setShowSeriesDialog(true);
        return;
      }
    }

    // Single plan or only one in series - edit directly
    setCalendarSelectedPlan(plan);
    setCalendarShowDetailModal(false);
    router.push(`/plan/${plan.id}/edit`);
  }, [setCalendarSelectedPlan, setCalendarShowDetailModal, router, getPlansInSeries]);

  const handleViewPdf = useCallback((plan: Plan) => {
    openPdfTemplateModal(plan);
  }, [openPdfTemplateModal]);

  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePlan, setSharePlan] = useState<Plan | null>(null);

  // Series action state
  const [showSeriesDialog, setShowSeriesDialog] = useState(false);
  const [seriesActionType, setSeriesActionType] = useState<'edit' | 'delete'>('edit');
  const [deleteSeriesMode, setDeleteSeriesMode] = useState<'single' | 'all'>('single');

  // Get series count for the selected plan
  const seriesCount = useMemo(() => {
    if (!calendarSelectedPlan?.seriesId) return 0;
    return getPlansInSeries(calendarSelectedPlan.seriesId).length;
  }, [calendarSelectedPlan?.seriesId, getPlansInSeries]);

  const handleShare = useCallback((plan: Plan) => {
    setSharePlan(plan);
    setShowShareModal(true);
  }, []);

  const handleAddToCalendar = useCallback((plan: Plan) => {
    // Generate iCal content
    const icalContent = generateICalEvent(plan, {
      teamName: team?.name,
    });

    // Create a Blob and download
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const filename = generateICalFilename(plan, team?.name);

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [team?.name]);

  const handleDelete = useCallback((plan: Plan) => {
    // Check if this is part of a series
    if (plan.seriesId) {
      const plansInSeries = getPlansInSeries(plan.seriesId);
      if (plansInSeries.length > 1) {
        // Show series action dialog
        setCalendarSelectedPlan(plan);
        setSeriesActionType('delete');
        setShowSeriesDialog(true);
        return;
      }
    }

    // Single plan or only one in series - delete directly
    setCalendarSelectedPlan(plan);
    setDeleteSeriesMode('single');
    setCalendarShowDeleteAlert(true);
  }, [setCalendarSelectedPlan, setCalendarShowDeleteAlert, getPlansInSeries]);

  const handleConfirmDelete = useCallback(async () => {
    if (!team?.id || !calendarSelectedPlan?.id) return;

    try {
      if (deleteSeriesMode === 'all' && calendarSelectedPlan.seriesId) {
        await deletePlanSeries(team.id, calendarSelectedPlan.seriesId);
      } else {
        await deletePlan(team.id, calendarSelectedPlan.id);
      }
      setCalendarShowDeleteAlert(false);
      setCalendarSelectedPlan(null);
    } catch (error) {
      console.error('Failed to delete plan:', error);
      // Error is handled by the store slice
    }
  }, [team?.id, calendarSelectedPlan, deleteSeriesMode, deletePlan, deletePlanSeries, setCalendarShowDeleteAlert, setCalendarSelectedPlan]);

  const handleCloseDetailModal = useCallback(() => {
    setCalendarShowDetailModal(false);
    setCalendarSelectedPlan(null);
  }, [setCalendarShowDetailModal, setCalendarSelectedPlan]);

  const handleCloseNewModal = useCallback(() => {
    setCalendarShowNewModal(false);
  }, [setCalendarShowNewModal]);

  const handleSaveNewPlan = useCallback(async (data: { date: Date; startTime: string }) => {
    if (!team?.id) return;

    // Parse the time string (e.g., "15:30") into hours and minutes
    const [hours, minutes] = data.startTime.split(':').map(Number);
    const startDateTime = new Date(data.date);
    startDateTime.setHours(hours, minutes, 0, 0);

    // Default duration of 90 minutes
    const defaultDuration = 90;
    const endDateTime = new Date(startDateTime.getTime() + defaultDuration * 60 * 1000);

    try {
      await createPlan(team.id, {
        uid: team.id,
        startTime: startDateTime.getTime(),
        endTime: endDateTime.getTime(),
        duration: defaultDuration,
        activities: [],
        tags: [],
        notes: '',
        readonly: false,
        col: `teams/${team.id}/plans`,
      });
      setCalendarShowNewModal(false);
    } catch (error) {
      console.error('Failed to create plan:', error);
      // Error is handled by the store slice
    }
  }, [team?.id, createPlan, setCalendarShowNewModal]);

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setCalendarSelectedDate(today);
    setCalendarCurrentMonth(today);
  }, [setCalendarSelectedDate, setCalendarCurrentMonth]);

  // Series action dialog handlers
  const handleSeriesEditThis = useCallback(() => {
    setShowSeriesDialog(false);
    if (calendarSelectedPlan) {
      router.push(`/plan/${calendarSelectedPlan.id}/edit`);
    }
  }, [calendarSelectedPlan, router]);

  const handleSeriesEditAll = useCallback(() => {
    setShowSeriesDialog(false);
    // For now, just edit this one - full series editing would need more UI work
    if (calendarSelectedPlan) {
      router.push(`/plan/${calendarSelectedPlan.id}/edit`);
    }
  }, [calendarSelectedPlan, router]);

  const handleSeriesDeleteThis = useCallback(() => {
    setShowSeriesDialog(false);
    setDeleteSeriesMode('single');
    setCalendarShowDeleteAlert(true);
  }, [setCalendarShowDeleteAlert]);

  const handleSeriesDeleteAll = useCallback(() => {
    setShowSeriesDialog(false);
    setDeleteSeriesMode('all');
    setCalendarShowDeleteAlert(true);
  }, [setCalendarShowDeleteAlert]);

  const handleSeriesDialogCancel = useCallback(() => {
    setShowSeriesDialog(false);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            View and manage your practice schedule
          </p>
        </div>
        <Button
          onClick={handleNewPractice}
          className="bg-[#356793] hover:bg-[#2a5275] w-full sm:w-auto"
          data-testid="add-plan"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Practice
        </Button>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <CalendarPageSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 flex-1 min-h-0">
          {/* Full Month Calendar */}
          <FullMonthCalendar
            currentMonth={calendarCurrentMonth}
            selectedDate={calendarSelectedDate}
            plans={plans}
            onDateSelect={handleDateSelect}
            onPreviousMonth={() => calendarNavigateMonth('prev')}
            onNextMonth={() => calendarNavigateMonth('next')}
            onPlanClick={handleViewDetails}
            onGoToToday={handleGoToToday}
          />

          {/* Week Practices List */}
          <WeekPracticesList
            selectedDate={calendarSelectedDate}
            plans={plans}
            isLoading={false}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onViewPdf={handleViewPdf}
            onShare={handleShare}
            onDelete={handleDelete}
            onAddPractice={handleNewPractice}
            onDateSelect={handleDateSelect}
          />
        </div>
      )}

      {/* Modals */}
      <PlanDetailModal
        open={calendarShowDetailModal}
        plan={calendarSelectedPlan}
        onClose={handleCloseDetailModal}
        onEdit={() => calendarSelectedPlan && handleEdit(calendarSelectedPlan)}
        onViewPdf={() => calendarSelectedPlan && handleViewPdf(calendarSelectedPlan)}
        onShare={() => calendarSelectedPlan && handleShare(calendarSelectedPlan)}
        onAddToCalendar={() => calendarSelectedPlan && handleAddToCalendar(calendarSelectedPlan)}
        onDelete={() => {
          if (calendarSelectedPlan) {
            setCalendarShowDetailModal(false);
            handleDelete(calendarSelectedPlan);
          }
        }}
      />

      <PlanNewModal
        open={calendarShowNewModal}
        initialDate={calendarSelectedDate}
        onClose={handleCloseNewModal}
        onSave={handleSaveNewPlan}
      />

      <DeleteConfirmDialog
        open={calendarShowDeleteAlert}
        plan={calendarSelectedPlan}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setCalendarShowDeleteAlert(false);
          setCalendarSelectedPlan(null);
        }}
        deleteMode={deleteSeriesMode}
        seriesCount={seriesCount}
      />

      <SeriesActionDialog
        open={showSeriesDialog}
        plan={calendarSelectedPlan}
        actionType={seriesActionType}
        seriesCount={seriesCount}
        onThisOnly={seriesActionType === 'edit' ? handleSeriesEditThis : handleSeriesDeleteThis}
        onAllInSeries={seriesActionType === 'edit' ? handleSeriesEditAll : handleSeriesDeleteAll}
        onCancel={handleSeriesDialogCancel}
      />

      <PdfTemplateModal
        teamName={team?.name}
        teamSport={team?.sport}
        headCoachName={user ? `${user.fname} ${user.lname}`.trim() : undefined}
        logoUrl={team?.logoUrl}
        primaryColor={team?.primaryColor}
        teamId={team?.id}
      />

      <PlanShareModal
        open={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSharePlan(null);
        }}
        plan={sharePlan}
        teamId={team?.id}
      />
    </div>
  );
}

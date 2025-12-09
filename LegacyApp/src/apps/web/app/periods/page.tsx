'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { Period } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { CheckCircle, X } from 'lucide-react';
import { MWViewSwitch } from '@ppa/mobile-web';
import {
  PeriodsDesktopTable,
  PeriodsMobileView,
  PeriodCreateModal,
  PeriodEditModal,
  PeriodDeleteDialog,
  PeriodsPageSkeleton,
} from '@/components/tp/periods';

export default function PeriodsPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const team = useAppStore((state) => state.team);
  const createPeriod = useAppStore((state) => state.createPeriod);
  const updatePeriod = useAppStore((state) => state.updatePeriod);
  const deletePeriod = useAppStore((state) => state.deletePeriod);

  const {
    periodsSearchQuery,
    periodsShowCreateModal,
    periodsShowEditModal,
    periodsShowDeleteAlert,
    periodsSelectedPeriod,
    // periodsIsLoading is now handled by store via subscription
    setPeriodsSearchQuery,
    setPeriodsShowCreateModal,
    setPeriodsShowEditModal,
    setPeriodsShowDeleteAlert,
    setPeriodsSelectedPeriod,
    // setPeriodsIsLoading not needed
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

  // Get periods from store
  const periods = useAppStore((state) => state.periods);
  const periodsLoading = useAppStore((state) => state.periodsLoading);
  const isAppLoading = useAppStore((state) => state.isAppLoading);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  // Filter and sort periods
  const filteredPeriods = useMemo(() => {
    const query = periodsSearchQuery.toLowerCase();
    return periods
      .filter((period) => period.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [periodsSearchQuery, periods]);

  // Handlers
  const handleCreateClick = useCallback(() => {
    setPeriodsShowCreateModal(true);
  }, [setPeriodsShowCreateModal]);

  const handleRowClick = useCallback((period: Period) => {
    setPeriodsSelectedPeriod(period);
    setPeriodsShowEditModal(true);
  }, [setPeriodsSelectedPeriod, setPeriodsShowEditModal]);

  const handleDeleteClick = useCallback((period: Period) => {
    setPeriodsSelectedPeriod(period);
    setPeriodsShowDeleteAlert(true);
  }, [setPeriodsSelectedPeriod, setPeriodsShowDeleteAlert]);

  const handleCreatePeriod = useCallback(async (data: { name: string; duration: number; notes: string; tags: string[] }) => {
    if (!team?.id) return;
    
    try {
      await createPeriod(team.id, {
        name: data.name,
        duration: data.duration,
        notes: data.notes,
        added: false,
        col: `teams/${team.id}/periods`,
        tags: data.tags,
      });
      
      setPeriodsShowCreateModal(false);
      setSuccessMessage(`Period "${data.name}" created successfully`);
    } catch (error) {
      console.error('Failed to create period:', error);
    }
  }, [team?.id, createPeriod, setPeriodsShowCreateModal]);

  const handleSavePeriod = useCallback(async (period: Period, data: { name: string; duration: number; notes: string; tags: string[] }) => {
    if (!team?.id) return;

    try {
      await updatePeriod(team.id, period.id, {
        name: data.name,
        duration: data.duration,
        notes: data.notes,
        tags: data.tags,
      });
      
      setPeriodsShowEditModal(false);
      setPeriodsSelectedPeriod(null);
      setSuccessMessage(`Period "${data.name}" updated successfully`);
    } catch (error) {
      console.error('Failed to update period:', error);
    }
  }, [team?.id, updatePeriod, setPeriodsShowEditModal, setPeriodsSelectedPeriod]);

  const handleConfirmDelete = useCallback(async () => {
    if (!team?.id || !periodsSelectedPeriod) return;
    
    const periodName = periodsSelectedPeriod.name;
    try {
      await deletePeriod(team.id, periodsSelectedPeriod.id);
      
      setPeriodsShowDeleteAlert(false);
      setPeriodsSelectedPeriod(null);
      setSuccessMessage(`Period "${periodName}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete period:', error);
    }
  }, [team?.id, periodsSelectedPeriod, deletePeriod, setPeriodsShowDeleteAlert, setPeriodsSelectedPeriod]);

  const handleCloseCreateModal = useCallback(() => {
    setPeriodsShowCreateModal(false);
  }, [setPeriodsShowCreateModal]);

  const handleCloseEditModal = useCallback(() => {
    setPeriodsShowEditModal(false);
    setPeriodsSelectedPeriod(null);
  }, [setPeriodsShowEditModal, setPeriodsSelectedPeriod]);

  const handleCancelDelete = useCallback(() => {
    setPeriodsShowDeleteAlert(false);
    setPeriodsSelectedPeriod(null);
  }, [setPeriodsShowDeleteAlert, setPeriodsSelectedPeriod]);

  if (isAppLoading && periods.length === 0) {
    return <PeriodsPageSkeleton />;
  }

  return (
    <>
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile/Desktop View Switching */}
      <MWViewSwitch
        mobile={
          <PeriodsMobileView
            periods={filteredPeriods}
            totalCount={periods.length}
            searchQuery={periodsSearchQuery}
            onSearchChange={setPeriodsSearchQuery}
            onRowClick={handleRowClick}
            onDelete={handleDeleteClick}
            onAdd={handleCreateClick}
          />
        }
        desktop={
          <PeriodsDesktopTable
            periods={filteredPeriods}
            totalCount={periods.length}
            searchQuery={periodsSearchQuery}
            onSearchChange={setPeriodsSearchQuery}
            onRowClick={handleRowClick}
            onDelete={handleDeleteClick}
            onAdd={handleCreateClick}
          />
        }
      />

      {/* Modals */}
      <PeriodCreateModal
        open={periodsShowCreateModal}
        onClose={handleCloseCreateModal}
        onCreate={handleCreatePeriod}
      />

      <PeriodEditModal
        open={periodsShowEditModal}
        period={periodsSelectedPeriod}
        onClose={handleCloseEditModal}
        onSave={handleSavePeriod}
      />

      <PeriodDeleteDialog
        open={periodsShowDeleteAlert}
        period={periodsSelectedPeriod}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

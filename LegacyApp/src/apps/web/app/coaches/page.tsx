'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { Coach, CoachPermission, CoachStatus } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import {
  CoachesDesktopTable,
  CoachesMobileView,
  CoachAddModal,
  CoachEditModal,
  CoachRemoveDialog,
  CoachesPageSkeleton,
} from '@/components/tp/coaches';
import { MWViewSwitch } from '@ppa/mobile-web';

export default function CoachesPage() {
  const {
    coachesSearchQuery,
    coachesShowInviteModal,
    coachesShowEditModal,
    coachesShowRemoveAlert,
    coachesSelectedCoach,
    coachesIsLoading,
    setCoachesSearchQuery,
    setCoachesShowInviteModal,
    setCoachesShowEditModal,
    setCoachesShowRemoveAlert,
    setCoachesSelectedCoach,
    setCoachesIsLoading,
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

  const team = useAppStore((state) => state.team);
  const createCoach = useAppStore((state) => state.createCoach);
  const updateCoach = useAppStore((state) => state.updateCoach);
  const deleteCoach = useAppStore((state) => state.deleteCoach);
  const coaches = useAppStore((state) => state.coaches);

  // Simulate initial loading
  useEffect(() => {
    setCoachesIsLoading(true);
    const timer = setTimeout(() => {
      setCoachesIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [setCoachesIsLoading]);

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  // Filter coaches
  const filteredCoaches = useMemo(() => {
    const query = coachesSearchQuery.toLowerCase();
    return coaches.filter((coach) =>
      coach.email.toLowerCase().includes(query)
    );
  }, [coachesSearchQuery, coaches]);

  // Handlers
  const handleInviteClick = useCallback(() => {
    setCoachesShowInviteModal(true);
  }, [setCoachesShowInviteModal]);

  const handleRowClick = useCallback((coach: Coach) => {
    setCoachesSelectedCoach(coach as any);
    setCoachesShowEditModal(true);
  }, [setCoachesSelectedCoach, setCoachesShowEditModal]);

  const handleDeleteClick = useCallback((coach: Coach) => {
    setCoachesSelectedCoach(coach as any);
    setCoachesShowRemoveAlert(true);
  }, [setCoachesSelectedCoach, setCoachesShowRemoveAlert]);

  const handleAddCoach = useCallback(async (email: string, permission: CoachPermission) => {
    if (!team?.id) return;

    try {
      await createCoach(team.id, {
        email,
        permission,
        status: 'active',
        col: `teams/${team.id}/coaches`,
        joinedAt: Date.now(),
      });
      setCoachesShowInviteModal(false);
    } catch (error) {
      console.error('Failed to add coach:', error);
    }
  }, [team?.id, createCoach, setCoachesShowInviteModal]);

  const handleSaveCoach = useCallback(async (coach: Coach, permission: CoachPermission, status: CoachStatus) => {
    if (!team?.id) return;

    try {
      await updateCoach(team.id, coach.id, {
        permission,
        status,
      });
      setCoachesShowEditModal(false);
      setCoachesSelectedCoach(null);
    } catch (error) {
      console.error('Failed to update coach:', error);
    }
  }, [team?.id, updateCoach, setCoachesShowEditModal, setCoachesSelectedCoach]);

  const handleConfirmRemove = useCallback(async () => {
    if (!team?.id || !coachesSelectedCoach) return;

    try {
      await deleteCoach(team.id, coachesSelectedCoach.id);
      setCoachesShowRemoveAlert(false);
      setCoachesSelectedCoach(null);
    } catch (error) {
      console.error('Failed to remove coach:', error);
    }
  }, [team?.id, coachesSelectedCoach, deleteCoach, setCoachesShowRemoveAlert, setCoachesSelectedCoach]);

  const handleCloseInviteModal = useCallback(() => {
    setCoachesShowInviteModal(false);
  }, [setCoachesShowInviteModal]);

  const handleCloseEditModal = useCallback(() => {
    setCoachesShowEditModal(false);
    setCoachesSelectedCoach(null);
  }, [setCoachesShowEditModal, setCoachesSelectedCoach]);

  const handleCancelRemove = useCallback(() => {
    setCoachesShowRemoveAlert(false);
    setCoachesSelectedCoach(null);
  }, [setCoachesShowRemoveAlert, setCoachesSelectedCoach]);

  // Cast selected coach for the modals
  const selectedCoachWithDetails = coachesSelectedCoach as Coach | null;

  if (coachesIsLoading) {
    return <CoachesPageSkeleton />;
  }

  return (
    <>
      <MWViewSwitch
        mobile={
          <CoachesMobileView
            coaches={filteredCoaches}
            totalCount={coaches.length}
            searchQuery={coachesSearchQuery}
            onSearchChange={setCoachesSearchQuery}
            onRowClick={handleRowClick}
            onAdd={handleInviteClick}
            loading={coachesIsLoading}
            canAdd={true}
          />
        }
        desktop={
          <CoachesDesktopTable
            coaches={filteredCoaches}
            totalCount={coaches.length}
            searchQuery={coachesSearchQuery}
            onSearchChange={setCoachesSearchQuery}
            showStatus
            onRowClick={handleRowClick}
            onDelete={handleDeleteClick}
            onAdd={handleInviteClick}
          />
        }
      />

      {/* Modals */}
      <CoachAddModal
        open={coachesShowInviteModal}
        onClose={handleCloseInviteModal}
        onAdd={handleAddCoach}
      />

      <CoachEditModal
        open={coachesShowEditModal}
        coach={selectedCoachWithDetails}
        onClose={handleCloseEditModal}
        onSave={handleSaveCoach}
      />

      <CoachRemoveDialog
        open={coachesShowRemoveAlert}
        coach={selectedCoachWithDetails}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </>
  );
}

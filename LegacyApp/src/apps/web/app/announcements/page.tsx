'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Announcement, AnnouncementPriority, NotificationOptions } from '@ppa/interfaces';
import { useAppStore, useLazyAnnouncements } from '@ppa/store';
import { sendAnnouncementNotifications } from '@ppa/firebase';
import { CheckCircle, X } from 'lucide-react';
import {
  AnnouncementsDesktopView,
  AnnouncementsMobileView,
  AnnouncementDetailModal,
  AnnouncementCreateModal,
  AnnouncementEditModal,
  AnnouncementDeleteDialog,
  AnnouncementsPageSkeleton,
} from '@/components/tp/announcements';
import { MWViewSwitch } from '@ppa/mobile-web';

export default function AnnouncementsPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const team = useAppStore((state) => state.team);
  const createAnnouncement = useAppStore((state) => state.createAnnouncement);
  const updateAnnouncement = useAppStore((state) => state.updateAnnouncement);
  const deleteAnnouncement = useAppStore((state) => state.deleteAnnouncement);
  const user = useAppStore((state) => state.user);
  
  const { announcements, isLoading: isAnnouncementsLoading } = useLazyAnnouncements();

  const {
    announcementsSearchQuery,
    announcementsSortBy,
    announcementsShowCreateModal,
    announcementsShowDetailModal,
    announcementsShowEditModal,
    announcementsShowDeleteAlert,
    announcementsSelectedAnnouncement,
    announcementsIsLoading,
    setAnnouncementsSearchQuery,
    setAnnouncementsSortBy,
    setAnnouncementsShowCreateModal,
    setAnnouncementsShowDetailModal,
    setAnnouncementsShowEditModal,
    setAnnouncementsShowDeleteAlert,
    setAnnouncementsSelectedAnnouncement,
    setAnnouncementsIsLoading,
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

  // Handle deep link from notification
  useEffect(() => {
    const announcementId = searchParams.get('id');
    if (announcementId && announcements.length > 0 && !isAnnouncementsLoading) {
      const announcement = announcements.find((a) => a.id === announcementId);
      if (announcement) {
        setAnnouncementsSelectedAnnouncement(announcement);
        setAnnouncementsShowDetailModal(true);
        router.replace('/announcements', { scroll: false });
      }
    }
  }, [searchParams, announcements, isAnnouncementsLoading, setAnnouncementsSelectedAnnouncement, setAnnouncementsShowDetailModal, router]);

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

  // Filter and sort announcements
  const mappedAnnouncements = useMemo(() => {
    return announcements.map((a) => ({
      ...a,
      isRead: a.readBy?.includes(user?.uid || '') ?? false,
    }));
  }, [announcements, user]);

  const filteredAnnouncements = useMemo(() => {
    const query = announcementsSearchQuery.toLowerCase();
    const now = Date.now();
    return mappedAnnouncements
      .filter(
        (announcement) =>
          (announcement.title.toLowerCase().includes(query) ||
          announcement.message.toLowerCase().includes(query)) &&
          (!announcement.scheduledAt || announcement.scheduledAt <= now)
      )
      .sort((a, b) => {
        // Pinned items first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then by date based on sort preference
        if (announcementsSortBy === 'newest') {
          return b.createdAt - a.createdAt;
        } else {
          return a.createdAt - b.createdAt;
        }
      });
  }, [announcementsSearchQuery, announcementsSortBy, mappedAnnouncements]);

  const unreadCount = useMemo(() => {
    return mappedAnnouncements.filter((a) => !a.isRead).length;
  }, [mappedAnnouncements]);

  // Handlers
  const handleCreateClick = useCallback(() => {
    setAnnouncementsShowCreateModal(true);
  }, [setAnnouncementsShowCreateModal]);

  const handleCardClick = useCallback((announcement: Announcement) => {
    setAnnouncementsSelectedAnnouncement(announcement as any);
    setAnnouncementsShowDetailModal(true);
  }, [setAnnouncementsSelectedAnnouncement, setAnnouncementsShowDetailModal]);

  const handleCreateAnnouncement = useCallback(
    async (data: {
      title: string;
      message: string;
      priority: AnnouncementPriority;
      notificationOptions: NotificationOptions;
    }) => {
      if (!team?.id) return;

      const createdByName = user?.fname && user?.lname
        ? `${user.fname} ${user.lname}`
        : user?.email || 'Unknown';

      try {
        const announcement = await createAnnouncement(team.id, {
          title: data.title,
          message: data.message,
          priority: data.priority,
          createdBy: createdByName,
          readBy: [],
          createdAt: Date.now(),
          notificationOptions: data.notificationOptions,
        });

        if (data.notificationOptions.sendPush || data.notificationOptions.sendEmail) {
          try {
            await sendAnnouncementNotifications(
              team.id,
              announcement.id,
              data.title,
              data.message,
              data.notificationOptions
            );
          } catch (notifError) {
            console.error('Failed to send notifications:', notifError);
          }
        }

        setAnnouncementsShowCreateModal(false);
        setSuccessMessage('Announcement sent successfully');
      } catch (error) {
        console.error('Failed to create announcement:', error);
      }
    },
    [team?.id, user, createAnnouncement, setAnnouncementsShowCreateModal]
  );

  const handleEditFromDetail = useCallback((announcement: any) => {
    setAnnouncementsShowDetailModal(false);
    setAnnouncementsShowEditModal(true);
  }, [setAnnouncementsShowDetailModal, setAnnouncementsShowEditModal]);

  const handleDeleteFromDetail = useCallback((announcement: any) => {
    setAnnouncementsShowDetailModal(false);
    setAnnouncementsShowDeleteAlert(true);
  }, [setAnnouncementsShowDetailModal, setAnnouncementsShowDeleteAlert]);

  const handleSaveAnnouncement = useCallback(
    async (
      announcement: any,
      data: {
        title: string;
        message: string;
        priority: AnnouncementPriority;
        notificationOptions?: NotificationOptions;
      }
    ) => {
      if (!team?.id) return;

      try {
        await updateAnnouncement(team.id, announcement.id, {
          title: data.title,
          message: data.message,
          priority: data.priority,
        });

        if (data.notificationOptions && (data.notificationOptions.sendPush || data.notificationOptions.sendEmail)) {
          try {
            await sendAnnouncementNotifications(
              team.id,
              announcement.id,
              data.title,
              data.message,
              data.notificationOptions
            );
          } catch (notifError) {
            console.error('Failed to send notifications:', notifError);
          }
        }

        setAnnouncementsShowEditModal(false);
        setAnnouncementsSelectedAnnouncement(null);
        setSuccessMessage('Announcement updated successfully');
      } catch (error) {
        console.error('Failed to update announcement:', error);
      }
    },
    [team?.id, updateAnnouncement, setAnnouncementsShowEditModal, setAnnouncementsSelectedAnnouncement]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!team?.id || !announcementsSelectedAnnouncement) return;

    const title = announcementsSelectedAnnouncement?.title;
    try {
      await deleteAnnouncement(team.id, announcementsSelectedAnnouncement.id);
      setAnnouncementsShowDeleteAlert(false);
      setAnnouncementsSelectedAnnouncement(null);
      setSuccessMessage(`Announcement "${title}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  }, [team?.id, announcementsSelectedAnnouncement, deleteAnnouncement, setAnnouncementsShowDeleteAlert, setAnnouncementsSelectedAnnouncement]);

  const handleCloseCreateModal = useCallback(() => {
    setAnnouncementsShowCreateModal(false);
  }, [setAnnouncementsShowCreateModal]);

  const handleCloseDetailModal = useCallback(() => {
    setAnnouncementsShowDetailModal(false);
    setAnnouncementsSelectedAnnouncement(null);
  }, [setAnnouncementsShowDetailModal, setAnnouncementsSelectedAnnouncement]);

  const handleCloseEditModal = useCallback(() => {
    setAnnouncementsShowEditModal(false);
    setAnnouncementsSelectedAnnouncement(null);
  }, [setAnnouncementsShowEditModal, setAnnouncementsSelectedAnnouncement]);

  const handleCancelDelete = useCallback(() => {
    setAnnouncementsShowDeleteAlert(false);
    setAnnouncementsSelectedAnnouncement(null);
  }, [setAnnouncementsShowDeleteAlert, setAnnouncementsSelectedAnnouncement]);

  const handleTogglePin = useCallback(
    async (announcement: Announcement, pinned: boolean) => {
      if (!team?.id) return;
      try {
        await updateAnnouncement(team.id, announcement.id, { isPinned: pinned });
        setSuccessMessage(pinned ? 'Announcement pinned' : 'Announcement unpinned');
      } catch (error) {
        console.error('Failed to toggle pin:', error);
      }
    },
    [team?.id, updateAnnouncement]
  );

  if (announcementsIsLoading || isAnnouncementsLoading) {
    return <AnnouncementsPageSkeleton />;
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

      <MWViewSwitch
        mobile={
          <AnnouncementsMobileView
            announcements={announcements}
            onRowClick={handleCardClick}
            onAdd={handleCreateClick}
            loading={announcementsIsLoading}
            currentUserId={user?.uid}
          />
        }
        desktop={
          <AnnouncementsDesktopView
            announcements={filteredAnnouncements}
            totalCount={announcements.length}
            unreadCount={unreadCount}
            searchQuery={announcementsSearchQuery}
            sortBy={announcementsSortBy}
            onSearchChange={setAnnouncementsSearchQuery}
            onSortChange={setAnnouncementsSortBy}
            onCardClick={handleCardClick}
            onAdd={handleCreateClick}
          />
        }
      />

      {/* Modals */}
      <AnnouncementDetailModal
        open={announcementsShowDetailModal}
        announcement={announcementsSelectedAnnouncement}
        onClose={handleCloseDetailModal}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
        onTogglePin={handleTogglePin}
      />

      <AnnouncementCreateModal
        open={announcementsShowCreateModal}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateAnnouncement}
      />

      <AnnouncementEditModal
        open={announcementsShowEditModal}
        announcement={announcementsSelectedAnnouncement}
        onClose={handleCloseEditModal}
        onSave={handleSaveAnnouncement}
      />

      <AnnouncementDeleteDialog
        open={announcementsShowDeleteAlert}
        announcement={announcementsSelectedAnnouncement}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

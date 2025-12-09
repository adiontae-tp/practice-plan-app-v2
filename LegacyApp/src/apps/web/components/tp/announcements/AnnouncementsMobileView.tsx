'use client';

import { Announcement, AnnouncementPriority } from '@ppa/interfaces';
import { MWCard, MWCardIcon, MWPageContent } from '@ppa/mobile-web';
import { Bell, Pin } from 'lucide-react';
import { TPFooterButtons } from '@/components/tp';

export interface AnnouncementsMobileViewProps {
  announcements: Announcement[];
  onRowClick: (announcement: Announcement) => void;
  onAdd: () => void;
  loading?: boolean;
  currentUserId?: string;
}

// Format timestamp helper
function formatDate(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Priority color helper
function getPriorityColor(priority: AnnouncementPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * AnnouncementsMobileView - Mobile-optimized view for announcements
 *
 * Matches mobile app pattern:
 * - NO SearchBar (different from other pages)
 * - Individual cards with priority badges, pin indicator, read state
 * - Different background for unread announcements
 * - TPFooterButtons at bottom (Close / Add Announcement)
 * - Sorted by pinned first, then by date
 */
export function AnnouncementsMobileView({
  announcements,
  onRowClick,
  onAdd,
  loading = false,
  currentUserId,
}: AnnouncementsMobileViewProps) {
  // Sort: pinned first, then by date (most recent first)
  const sortedAnnouncements = [...announcements]
    .filter((a) => !a.scheduledAt || a.scheduledAt <= Date.now())
    .sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by date (most recent first)
      return b.createdAt - a.createdAt;
    });

  const isAnnouncementRead = (announcement: Announcement) => {
    return announcement.readBy?.includes(currentUserId || '') ?? false;
  };

  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <MWPageContent>
          <div className="flex flex-col gap-4 pb-24">
            {/* Content */}
            {loading ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#356793] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500">Loading announcements...</p>
              </div>
            ) : sortedAnnouncements.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-20">
                <MWCardIcon color="gray" size="lg">
                  <Bell className="w-8 h-8" />
                </MWCardIcon>
                <h3 className="text-lg font-semibold text-gray-700 mt-4">
                  No Announcements
                </h3>
                <p className="text-sm text-gray-500 mt-1 text-center px-8">
                  Team updates will appear here
                </p>
              </div>
            ) : (
              // Announcements list
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3 ml-1">
                  Recent
                </p>
                {sortedAnnouncements.map((announcement) => {
                  const isRead = isAnnouncementRead(announcement);
                  const priorityClasses = getPriorityColor(announcement.priority);

                  return (
                    <MWCard
                      key={announcement.id}
                      onPress={() => onRowClick(announcement)}
                      className={
                        isRead
                          ? ''
                          : 'bg-blue-50 border border-blue-200'
                      }
                    >
                      <div className="flex flex-col gap-2">
                        {/* Header: Priority, Pin, Unread, Timestamp */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {announcement.isPinned && (
                              <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${priorityClasses}`}>
                              {announcement.priority}
                            </span>
                            {!isRead && (
                              <div className="w-2 h-2 rounded-full bg-[#356793]" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(announcement.createdAt)}
                          </span>
                        </div>

                        {/* Title */}
                        <p className={`text-base text-gray-900 truncate ${isRead ? 'font-medium' : 'font-bold'}`}>
                          {announcement.title}
                        </p>

                        {/* Message preview */}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {announcement.message}
                        </p>

                        {/* Created by */}
                        <p className="text-xs text-gray-500">
                          By {announcement.createdBy}
                        </p>
                      </div>
                    </MWCard>
                  );
                })}
              </div>
            )}
          </div>
        </MWPageContent>
      </div>

      {/* Footer Buttons */}
      <TPFooterButtons
        mode="view"
        onCancel={() => window.history.back()}
        onEdit={onAdd}
        cancelLabel="Close"
        editLabel="Add Announcement"
        canEdit={true}
      />
    </div>
  );
}

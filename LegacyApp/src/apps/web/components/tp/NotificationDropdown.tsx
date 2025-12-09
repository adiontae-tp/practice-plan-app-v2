'use client';

import { useRouter } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore, useLazyAnnouncements } from '@ppa/store';
import { useMemo } from 'react';
import { Announcement } from '@ppa/interfaces';

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

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

interface AnnouncementWithRead extends Announcement {
  isRead: boolean;
}

export function NotificationDropdown() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const setAnnouncementsSelectedAnnouncement = useAppStore(
    (state) => state.setAnnouncementsSelectedAnnouncement
  );
  const setAnnouncementsShowDetailModal = useAppStore(
    (state) => state.setAnnouncementsShowDetailModal
  );

  const { announcements } = useLazyAnnouncements();

  const unreadAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => !a.readBy?.includes(user?.uid || ''))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5) as AnnouncementWithRead[];
  }, [announcements, user?.uid]);

  const unreadCount = useMemo(() => {
    return announcements.filter((a) => !a.readBy?.includes(user?.uid || '')).length;
  }, [announcements, user?.uid]);

  const handleAnnouncementClick = (announcement: AnnouncementWithRead) => {
    setAnnouncementsSelectedAnnouncement(announcement);
    setAnnouncementsShowDetailModal(true);
    router.push('/announcements');
  };

  const handleViewAll = () => {
    router.push('/announcements');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/15 hover:text-white rounded-lg transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-secondary-500 text-white text-[10px] font-semibold rounded-full border-2 border-primary-500 px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {unreadAnnouncements.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No new notifications
          </div>
        ) : (
          <>
            <div className="max-h-[400px] overflow-y-auto">
              {unreadAnnouncements.map((announcement) => (
                <DropdownMenuItem
                  key={announcement.id}
                  className="cursor-pointer flex-col items-start gap-1 p-3 focus:bg-gray-50"
                  onClick={() => handleAnnouncementClick(announcement)}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#356793] shrink-0" />
                        <p className="font-medium text-sm text-gray-900 line-clamp-1">
                          {announcement.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {announcement.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(announcement.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer justify-center text-center text-sm font-medium text-primary-500 hover:text-primary-600 focus:text-primary-600"
              onClick={handleViewAll}
            >
              View all announcements
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}





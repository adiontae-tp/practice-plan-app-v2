'use client';
// Triggering a build test
import { Announcement } from '@ppa/interfaces';
import { Pin } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';

interface AnnouncementWithRead extends Announcement {
  isRead: boolean;
}

interface AnnouncementCardProps {
  announcement: AnnouncementWithRead;
  onClick: () => void;
}

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

export function AnnouncementCard({ announcement, onClick }: AnnouncementCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-6 py-4 transition-colors hover:bg-gray-50 ${
        announcement.isRead ? '' : 'bg-blue-50/30'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {announcement.isPinned && (
              <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            )}
            <h3
              className={`text-base line-clamp-1 ${
                announcement.isRead ? 'font-medium text-gray-900' : 'font-semibold text-gray-900'
              }`}
            >
              {announcement.title}
            </h3>
            {!announcement.isRead && <span className="w-2 h-2 rounded-full bg-[#356793] shrink-0" />}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{announcement.message}</p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>By {announcement.createdBy}</span>
            <span>•</span>
            <span>{formatRelativeTime(announcement.createdAt)}</span>
            <PriorityBadge priority={announcement.priority} />
          </div>
        </div>
      </div>
    </button>
  );
}

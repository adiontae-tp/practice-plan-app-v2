'use client';

import { Announcement } from '@ppa/interfaces';
import { Search, Plus, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnnouncementCard } from './AnnouncementCard';

interface AnnouncementWithRead extends Announcement {
  isRead: boolean;
}

export interface AnnouncementsDesktopViewProps {
  announcements: AnnouncementWithRead[];
  totalCount: number;
  unreadCount: number;
  searchQuery: string;
  sortBy: 'newest' | 'oldest';
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: 'newest' | 'oldest') => void;
  onCardClick: (announcement: AnnouncementWithRead) => void;
  onAdd: () => void;
}

export function AnnouncementsDesktopView({
  announcements,
  totalCount,
  unreadCount,
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
  onCardClick,
  onAdd,
}: AnnouncementsDesktopViewProps) {
  return (
    <div className="space-y-4">
      {/* Header with search and add button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
          <span className="text-sm text-gray-500">({totalCount})</span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-500 text-white">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search announcements..."
              className="pl-10 w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort: {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortChange('newest')} className="gap-2">
                <ArrowDown className="h-4 w-4" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('oldest')} className="gap-2">
                <ArrowUp className="h-4 w-4" />
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={onAdd}
            className="bg-primary-500 hover:bg-primary-600"
            data-testid="add-announcement"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {searchQuery ? `No announcements found matching "${searchQuery}"` : 'No announcements yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onClick={() => onCardClick(announcement)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

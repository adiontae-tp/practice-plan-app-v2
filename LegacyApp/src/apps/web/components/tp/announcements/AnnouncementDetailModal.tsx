'use client';

import { useEffect, useCallback, useState, useMemo } from 'react';
import { Announcement } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { markAnnouncementRead } from '@ppa/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash2, Pin, Eye, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';

interface AnnouncementDetailModalProps {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onTogglePin?: (announcement: Announcement, pinned: boolean) => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AnnouncementDetailModal({
  open,
  announcement,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
}: AnnouncementDetailModalProps) {
  const team = useAppStore((state) => state.team);
  const user = useAppStore((state) => state.user);
  const coaches = useAppStore((state) => state.coaches);
  const [isPinning, setIsPinning] = useState(false);
  const [showReadReceipts, setShowReadReceipts] = useState(false);

  const isAdmin = user?.isAdmin === 'true';

  const readReceipts = useMemo(() => {
    if (!announcement?.readBy || !coaches.length) return { read: [], unread: [] };
    
    const readBySet = new Set(announcement.readBy);
    const read = coaches.filter((c) => readBySet.has(c.id));
    const unread = coaches.filter((c) => !readBySet.has(c.id));
    
    return { read, unread };
  }, [announcement?.readBy, coaches]);

  const readCount = readReceipts.read.length;
  const totalCount = coaches.length;

  useEffect(() => {
    if (open && announcement && team?.id && user?.uid) {
      const isAlreadyRead = announcement.readBy?.includes(user.uid);
      if (!isAlreadyRead) {
        markAnnouncementRead(team.id, announcement.id, user.uid).catch((error) => {
          console.error('Failed to mark announcement as read:', error);
        });
      }
    }
  }, [open, announcement, team?.id, user?.uid]);

  const handleTogglePin = useCallback(async () => {
    if (!announcement || !onTogglePin) return;
    setIsPinning(true);
    try {
      await onTogglePin(announcement, !announcement.isPinned);
    } finally {
      setIsPinning(false);
    }
  }, [announcement, onTogglePin]);

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg" data-testid="announcement-detail">
        <DialogHeader>
          <DialogTitle>{announcement.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <PriorityBadge priority={announcement.priority} />
            <span className="text-sm text-gray-500">
              · {formatDate(announcement.createdAt)}
            </span>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-1 py-2 border-b border-gray-200">
          {onTogglePin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTogglePin}
                disabled={isPinning}
                className={announcement.isPinned ? 'text-amber-600 hover:text-amber-700' : ''}
              >
                <Pin className={`w-4 h-4 mr-1.5 ${announcement.isPinned ? 'fill-amber-500' : ''}`} />
                {announcement.isPinned ? 'Unpin' : 'Pin'}
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(announcement);
            }}
            data-testid="edit-announcement"
          >
            <Pencil className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              onDelete(announcement);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            data-testid="delete-announcement"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>

        {/* Message Content */}
        <div className="py-4">
          <p className="text-gray-700 whitespace-pre-wrap">
            {announcement.message}
          </p>
        </div>

        {/* Read Receipts (Admin Only) */}
        {isAdmin && totalCount > 0 && (
          <div className="border-t border-gray-200">
            <button
              onClick={() => setShowReadReceipts(!showReadReceipts)}
              className="w-full flex items-center justify-between py-3 text-sm text-gray-600 hover:text-gray-900"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>
                  Read by {readCount} of {totalCount} team members
                </span>
              </div>
              {showReadReceipts ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {showReadReceipts && (
              <div className="pb-3 space-y-2">
                {readReceipts.read.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Read</p>
                    <div className="space-y-1">
                      {readReceipts.read.map((coach) => (
                        <div key={coach.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span>{coach.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {readReceipts.unread.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Not Read</p>
                    <div className="space-y-1">
                      {readReceipts.unread.map((coach) => (
                        <div key={coach.id} className="flex items-center gap-2 text-sm text-gray-400">
                          <X className="w-3.5 h-3.5 text-gray-300" />
                          <span>{coach.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="py-3 border-t border-gray-200 text-sm text-gray-500">
          <span>Posted by {announcement.createdBy}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

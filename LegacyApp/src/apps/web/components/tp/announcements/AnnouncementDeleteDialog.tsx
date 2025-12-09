'use client';

import { Announcement } from '@ppa/interfaces';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AnnouncementDeleteDialogProps {
  open: boolean;
  announcement: Announcement | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AnnouncementDeleteDialog({
  open,
  announcement,
  onConfirm,
  onCancel,
}: AnnouncementDeleteDialogProps) {
  if (!announcement) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to delete the announcement &quot;{announcement.title}&quot;?
              </p>
              <p className="text-sm text-amber-600">
                This action cannot be undone. Team members will no longer be able to see this announcement.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-testid="confirm-delete"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface TeamDeleteDialogProps {
  open: boolean;
  teamName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function TeamDeleteDialog({
  open,
  teamName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: TeamDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isDeleting) {
      setConfirmText('');
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (confirmText === 'DELETE') {
      setConfirmText('');
      onConfirm();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Team?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete &quot;{teamName}&quot;?
              </p>
              <p className="text-sm text-red-600 font-medium">
                This action cannot be undone. All practice plans, templates, and team data will be permanently deleted.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type DELETE to confirm
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="font-mono"
                  disabled={isDeleting}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmText !== 'DELETE' || isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Team'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

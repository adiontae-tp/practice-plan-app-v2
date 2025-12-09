'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DeleteAccountCardProps {
  onDelete: (reason?: string) => Promise<void>;
  isDeleting?: boolean;
}

export function DeleteAccountCard({ onDelete, isDeleting = false }: DeleteAccountCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const handleDelete = async () => {
    try {
      await onDelete(deleteReason);
      setShowDialog(false);
      setDeleteReason(''); // Reset for next time
    } catch (error) {
      // Error handling is done in parent component
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-red-200 p-6">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Delete Account</h3>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. This will permanently delete
            your account, team data, and all associated information.
          </p>
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </p>
                  <p className="font-medium text-gray-900">
                    This includes:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 ml-2">
                    <li>Your user account and profile</li>
                    <li>All practice plans and templates</li>
                    <li>Team data (if you're the only admin)</li>
                    <li>Files and announcements</li>
                    <li>All other associated data</li>
                  </ul>
                </div>
              </AlertDialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="delete-reason" className="text-sm font-medium">
                  Why are you deleting your account? <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Your feedback helps us improve Practice Plan for other coaches.
                </p>
                <Textarea
                  id="delete-reason"
                  placeholder="e.g., Found another solution, Too expensive, Missing features I need..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  disabled={isDeleting}
                  className="resize-none"
                  rows={3}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}





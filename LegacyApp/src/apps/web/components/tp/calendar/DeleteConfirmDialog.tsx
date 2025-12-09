'use client';

import { Plan } from '@ppa/interfaces';
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

interface DeleteConfirmDialogProps {
  open: boolean;
  plan: Plan | null;
  onConfirm: () => void;
  onCancel: () => void;
  /** Whether to delete single plan or all in series */
  deleteMode?: 'single' | 'all';
  /** Number of plans in the series (for display) */
  seriesCount?: number;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function DeleteConfirmDialog({
  open,
  plan,
  onConfirm,
  onCancel,
  deleteMode = 'single',
  seriesCount = 0,
}: DeleteConfirmDialogProps) {
  if (!plan) return null;

  const isSeriesDelete = deleteMode === 'all' && seriesCount > 1;
  const title = isSeriesDelete ? 'Delete All in Series?' : 'Delete Practice?';
  const message = isSeriesDelete
    ? `Are you sure you want to delete all ${seriesCount} practices in this series?`
    : 'Are you sure you want to delete this practice plan?';
  const buttonLabel = isSeriesDelete ? 'Delete All' : 'Delete';

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>{message}</p>
              <div className="bg-gray-50 rounded-md p-3 mt-2">
                <p className="font-medium text-gray-900">
                  {formatDate(plan.startTime)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTime(plan.startTime)} - {formatTime(plan.endTime)}
                </p>
                {isSeriesDelete && (
                  <p className="text-sm text-gray-500 mt-1">
                    + {seriesCount - 1} other practices in this series
                  </p>
                )}
              </div>
              <p className="text-sm text-red-600 font-medium mt-2">
                This action cannot be undone.
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
            {buttonLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

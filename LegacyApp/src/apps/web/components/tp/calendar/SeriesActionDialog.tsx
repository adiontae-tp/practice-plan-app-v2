'use client';

import { Plan } from '@ppa/interfaces';
import { Repeat } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SeriesActionDialogProps {
  open: boolean;
  plan: Plan | null;
  actionType: 'edit' | 'delete';
  seriesCount: number;
  onThisOnly: () => void;
  onAllInSeries: () => void;
  onCancel: () => void;
}

export function SeriesActionDialog({
  open,
  plan,
  actionType,
  seriesCount,
  onThisOnly,
  onAllInSeries,
  onCancel,
}: SeriesActionDialogProps) {
  if (!plan) return null;

  const title = actionType === 'edit' ? 'Edit Recurring Practice' : 'Delete Recurring Practice';
  const thisOnlyLabel = actionType === 'edit' ? 'Edit this practice only' : 'Delete this practice only';
  const thisOnlyDesc = actionType === 'edit'
    ? 'Changes will only apply to this date'
    : 'Other practices in the series will remain';
  const allLabel = actionType === 'edit' ? 'Edit all in series' : 'Delete all in series';
  const allDesc = actionType === 'edit'
    ? `Changes will apply to all ${seriesCount} practices`
    : `Remove all ${seriesCount} practices`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-[#356793]/10 rounded-full p-2.5">
              <Repeat className="w-5 h-5 text-[#356793]" />
            </div>
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                This is part of a series of {seriesCount} practices
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <button
            onClick={onThisOnly}
            className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">{thisOnlyLabel}</p>
            <p className="text-sm text-gray-500 mt-0.5">{thisOnlyDesc}</p>
          </button>

          <button
            onClick={onAllInSeries}
            className={`w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
              actionType === 'delete' ? 'border-red-200' : 'border-gray-200'
            }`}
          >
            <p className={`font-medium ${actionType === 'delete' ? 'text-red-600' : 'text-gray-900'}`}>
              {allLabel}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{allDesc}</p>
          </button>

          <Button
            variant="ghost"
            className="w-full text-gray-500"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

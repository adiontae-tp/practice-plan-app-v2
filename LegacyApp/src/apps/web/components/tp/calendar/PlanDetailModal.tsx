'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@ppa/store';
import { Plan } from '@ppa/interfaces';
import {
  Clock,
  ListChecks,
  Pencil,
  FileText,
  Share2,
  Trash2,
  CalendarPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface PlanDetailModalProps {
  open: boolean;
  plan: Plan | null;
  onClose: () => void;
  onEdit: () => void;
  onViewPdf: () => void;
  onShare: () => void;
  onDelete: () => void;
  onAddToCalendar?: () => void;
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

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export function PlanDetailModal({
  open,
  plan,
  onClose,
  onEdit,
  onViewPdf,
  onShare,
  onDelete,
  onAddToCalendar,
}: PlanDetailModalProps) {
  const router = useRouter();
  const setViewingNotes = useAppStore((state) => state.setViewingNotes);

  if (!plan) return null;

  const activities = plan.activities || [];

  const handleViewNotes = (activityName: string, notes: string) => {
    if (!notes) return;
    setViewingNotes({ activityName, notes });
    onClose();
    router.push('/notes');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Practice Plan
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(plan.startTime)}
              </p>
            </div>
          </div>

          {/* Time and Period Count */}
          <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(plan.startTime)} - {formatTime(plan.endTime)} ({formatDuration(plan.duration)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              <span>{activities.length} period{activities.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
            <Button variant="ghost" size="sm" onClick={onEdit} className="text-gray-600">
              <Pencil className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Button variant="ghost" size="sm" onClick={onViewPdf} className="text-gray-600">
              <FileText className="w-4 h-4 mr-1.5" />
              PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onShare} className="text-gray-600">
              <Share2 className="w-4 h-4 mr-1.5" />
              Share
            </Button>
            {onAddToCalendar && (
              <Button variant="ghost" size="sm" onClick={onAddToCalendar} className="text-gray-600">
                <CalendarPlus className="w-4 h-4 mr-1.5" />
                Calendar
              </Button>
            )}
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </DialogHeader>

        {/* Periods Table */}
        <div className="flex-1 overflow-auto py-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Periods
          </h3>

          {activities.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ListChecks className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-2">No periods yet</p>
              <p className="text-sm text-gray-400">
                Click Edit to add periods to this practice
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_140px_80px] bg-gray-50 text-gray-600 text-xs font-semibold uppercase border-b">
                <div className="px-4 py-3">Period</div>
                <div className="px-3 py-3">Time</div>
                <div className="px-3 py-3 text-right">Duration</div>
              </div>

              {/* Table Rows */}
              {activities.map((activity) => {
                const activityTags = Array.isArray(activity.tags)
                  ? activity.tags.filter((t) => typeof t === 'object' && 'name' in t) as Array<{ name: string }>
                  : [];

                return (
                  <div
                    key={activity.id}
                    className="grid grid-cols-[1fr_140px_80px] border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="px-4 py-3">
                      <div className="font-medium text-gray-900">{activity.name}</div>
                      {/* Add Notes Link if exists */}
                      {activity.notes && (
                        <button
                          onClick={() => handleViewNotes(activity.name, activity.notes!)}
                          className="text-xs text-[#356793] hover:underline mt-1 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          View Notes
                        </button>
                      )}
                      {activityTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activityTags.map((tag, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-3 text-sm text-gray-600">
                      <div>{formatTime(activity.startTime)}</div>
                      <div className="text-gray-400">to {formatTime(activity.endTime)}</div>
                    </div>
                    <div className="px-3 py-3 text-right">
                      <span className="text-sm font-medium text-gray-700">
                        {activity.duration} min
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Total Row */}
              <div className="grid grid-cols-[1fr_140px_80px] bg-gray-50 border-t">
                <div className="px-4 py-3">
                  <span className="font-semibold text-gray-700">Total</span>
                </div>
                <div className="px-3 py-3"></div>
                <div className="px-3 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-[#356793] text-white text-sm font-semibold">
                    {formatDuration(plan.duration)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

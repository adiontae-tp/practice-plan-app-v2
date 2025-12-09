'use client';

import { Plan } from '@ppa/interfaces';
import { MoreHorizontal, Eye, Pencil, FileText, Share2, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PracticeCardProps {
  plan: Plan;
  onViewDetails: (plan: Plan) => void;
  onEdit: (plan: Plan) => void;
  onViewPdf: (plan: Plan) => void;
  onShare: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  compact?: boolean;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();
}

function formatTimeShort(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const hour12 = hours % 12 || 12;
  if (minutes === 0) {
    return `${hour12}${ampm}`;
  }
  return `${hour12}:${String(minutes).padStart(2, '0')}${ampm}`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function PracticeCard({
  plan,
  onViewDetails,
  onEdit,
  onViewPdf,
  onShare,
  onDelete,
  compact = false,
}: PracticeCardProps) {
  const activityNames = plan.activities.slice(0, 3).map((a) => a.name);
  const activityCount = plan.activities.length;

  if (compact) {
    return (
      <div
        className="bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => onViewDetails(plan)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Time display with icon */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-[#356793]">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">
                  {formatTimeShort(plan.startTime)}
                </span>
                <span className="text-gray-400">–</span>
                <span className="text-sm font-semibold">
                  {formatTimeShort(plan.endTime)}
                </span>
              </div>
            </div>
            {/* Duration and period count */}
            <div className="text-xs text-gray-500 mb-1.5">
              {formatDuration(plan.duration)} • {activityCount} period{activityCount !== 1 ? 's' : ''}
            </div>
            {/* Period tags */}
            {activityNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activityNames.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600"
                  >
                    {name}
                  </span>
                ))}
                {activityCount > 3 && (
                  <span className="text-xs text-gray-400">+{activityCount - 3} more</span>
                )}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(plan); }}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(plan); }}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewPdf(plan); }}>
                <FileText className="w-4 h-4 mr-2" />
                View PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(plan); }}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => { e.stopPropagation(); onDelete(plan); }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onViewDetails(plan)}
      data-testid="plan-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Time Range with icon */}
          <div className="flex items-center gap-2 text-[#356793] mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-base font-semibold">
              {formatTimeShort(plan.startTime)}
            </span>
            <span className="text-gray-400">–</span>
            <span className="text-base font-semibold">
              {formatTimeShort(plan.endTime)}
            </span>
          </div>

          {/* Title */}
          <div className="text-lg font-semibold text-gray-900 mb-1">
            Practice Plan
          </div>

          {/* Duration and Period Count */}
          <div className="text-sm text-gray-500 mb-3">
            {formatDuration(plan.duration)} • {activityCount} period{activityCount !== 1 ? 's' : ''}
          </div>

          {/* Period Tags */}
          {activityNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activityNames.map((name, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600"
                >
                  {name}
                </span>
              ))}
              {activityCount > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-400">
                  +{activityCount - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon-sm" className="shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(plan); }}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(plan); }} data-testid="edit-plan">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewPdf(plan); }}>
              <FileText className="w-4 h-4 mr-2" />
              View PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(plan); }}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={(e) => { e.stopPropagation(); onDelete(plan); }}
              data-testid="delete-plan"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

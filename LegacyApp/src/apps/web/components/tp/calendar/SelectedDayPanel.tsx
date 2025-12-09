'use client';

import { Plan } from '@ppa/interfaces';
import { MoreHorizontal, Eye, Pencil, FileText, Share2, Trash2, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SelectedDayPanelProps {
  date: Date;
  plans: Plan[];
  onPlanClick: (plan: Plan) => void;
  onCreatePractice: () => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface PracticeListItemProps {
  plan: Plan;
  onPlanClick: (plan: Plan) => void;
}

function PracticeListItem({ plan, onPlanClick }: PracticeListItemProps) {
  const activityNames = plan.activities.map((a) => a.name).join(', ');

  return (
    <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <button
        onClick={() => onPlanClick(plan)}
        className="flex-1 text-left"
      >
        <div className="text-sm font-medium text-gray-900">
          {formatTime(plan.startTime)} - {formatTime(plan.endTime)} ({formatDuration(plan.duration)})
        </div>
        <div className="text-base font-semibold text-gray-900 mt-1">
          Practice Plan
        </div>
        {activityNames && (
          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
            Activities: {activityNames}
          </div>
        )}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onPlanClick(plan)}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileText className="w-4 h-4 mr-2" />
            View PDF
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function SelectedDayPanel({
  date,
  plans,
  onPlanClick,
  onCreatePractice,
}: SelectedDayPanelProps) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {formatDateHeader(date)}
        </h3>
        {plans.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreatePractice}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Practice
          </Button>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No practices on this day</p>
          <Button onClick={onCreatePractice} className="bg-[#356793] hover:bg-[#2a5275]">
            <Plus className="w-4 h-4 mr-1" />
            Add Practice
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <PracticeListItem key={plan.id} plan={plan} onPlanClick={onPlanClick} />
          ))}
        </div>
      )}
    </div>
  );
}

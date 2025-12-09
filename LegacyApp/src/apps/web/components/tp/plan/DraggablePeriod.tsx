'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Activity } from '@ppa/interfaces';

interface DraggablePeriodProps {
  activity: Activity;
  index: number;
  startTime: number;
  onRemove: (id: string) => void;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function DraggablePeriod({
  activity,
  index,
  startTime,
  onRemove,
}: DraggablePeriodProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate end time based on start time and duration
  const endTime = startTime + activity.duration * 60 * 1000;

  const tags = Array.isArray(activity.tags)
    ? activity.tags.filter((t: any) => typeof t === 'object' && 'name' in t)
    : [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-3 mb-2 flex items-center gap-3 group shadow-sm hover:border-[#356793] transition-colors"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Time Info */}
      <div className="min-w-[80px] text-xs text-gray-500 text-center border-r border-gray-100 pr-3">
        <div className="font-medium text-gray-900">{formatTime(startTime)}</div>
        <div>{formatTime(endTime)}</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {activity.name}
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            <span>{activity.duration}m</span>
          </div>
        </div>
        
        {/* Tags & Notes */}
        <div className="flex flex-wrap items-center gap-2">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
             <span className="text-xs text-gray-400 italic">No tags</span>
          )}
          
          {activity.notes && (
            <span className="text-xs text-gray-500 truncate max-w-[200px] border-l border-gray-200 pl-2 ml-1">
              {activity.notes}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(activity.id)}
        className="text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

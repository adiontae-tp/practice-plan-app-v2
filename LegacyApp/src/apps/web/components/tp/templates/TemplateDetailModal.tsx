'use client';

import { Template, Tag } from '@ppa/interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Pencil, Copy, Trash2, Clock } from 'lucide-react';

interface TemplateDetailModalProps {
  open: boolean;
  template: Template | null;
  onClose: () => void;
  onEdit: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  onDelete: (template: Template) => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getTagName(tag: Tag | any): string {
  if (typeof tag === 'object' && tag.name) {
    return tag.name;
  }
  return '';
}

export function TemplateDetailModal({
  open,
  template,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplateDetailModalProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg" data-testid="template-detail">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {formatDuration(template.duration)} · {template.activities.length} periods
          </p>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-1 py-2 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(template);
            }}
            data-testid="edit-template"
          >
            <Pencil className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(template)}
          >
            <Copy className="w-4 h-4 mr-1.5" />
            Duplicate
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              onDelete(template);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            data-testid="delete-template"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>

        {/* Periods List */}
        <div className="py-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Periods</h4>
          <div className="space-y-2">
            {template.activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="w-6 h-6 rounded-full bg-[#356793] text-white text-xs font-medium flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                  {activity.tags && activity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(activity.tags as Tag[]).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-200 text-gray-600"
                        >
                          {getTagName(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-sm">{activity.duration} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Duration */}
        <div className="flex justify-between items-center py-3 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Total Duration</span>
          <span className="text-sm font-semibold text-gray-900">{formatDuration(template.duration)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

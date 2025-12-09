'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@ppa/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TPRichTextEditor } from '@/components/tp';

interface PeriodCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; duration: number; notes: string; tags: string[] }) => void;
}

export function PeriodCreateModal({ open, onClose, onCreate }: PeriodCreateModalProps) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(15);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get tags from store
  const tags = useAppStore((state) => state.tags);

  useEffect(() => {
    if (open) {
      setName('');
      setDuration(15);
      setNotes('');
      setSelectedTags([]);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && duration > 0) {
      onCreate({
        name: name.trim(),
        duration,
        notes,
        tags: selectedTags,
      });
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Period</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Warm Up, Drills, Scrimmage..."
                autoFocus
                data-testid="period-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <Input
                type="number"
                min={1}
                max={180}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <TPRichTextEditor
              value={notes}
              onChange={setNotes}
              placeholder="Add any additional details..."
              label="Notes (optional)"
              minHeight={100}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <span className="text-sm text-gray-400">No tags available</span>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag.id)
                          ? 'bg-[#356793] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || duration < 1}
              className="bg-[#356793] hover:bg-[#2a5275]"
              data-testid="save-period"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Tag } from '@ppa/interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TagEditModalProps {
  open: boolean;
  tag: Tag | null;
  onClose: () => void;
  onSave: (tag: Tag, newName: string) => void;
}

export function TagEditModal({ open, tag, onClose, onSave }: TagEditModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open && tag) {
      setName(tag.name);
    }
  }, [open, tag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tag && name.trim()) {
      onSave(tag, name.trim());
      onClose();
    }
  };

  if (!tag) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tag name..."
              autoFocus
              data-testid="tag-name-input"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-[#356793] hover:bg-[#2a5275]"
              data-testid="save-tag"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

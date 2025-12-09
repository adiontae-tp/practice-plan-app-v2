'use client';

import { useState, useEffect } from 'react';
import { Template } from '@ppa/interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TemplateEditModalProps {
  open: boolean;
  template: Template | null;
  onClose: () => void;
  onSave: (template: Template, newName: string) => void;
}

export function TemplateEditModal({ open, template, onClose, onSave }: TemplateEditModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open && template) {
      setName(template.name);
    }
  }, [open, template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (template && name.trim()) {
      onSave(template, name.trim());
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Practice, Game Day Prep..."
              autoFocus
              data-testid="template-name-input"
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
              data-testid="save-template"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeamEditModalProps {
  open: boolean;
  name: string;
  sport: string;
  onClose: () => void;
  onSave: (data: { name: string; sport: string }) => void;
  isSaving?: boolean;
}

const sportOptions = [
  'Basketball',
  'Soccer',
  'Football',
  'Baseball',
  'Volleyball',
  'Hockey',
  'Tennis',
  'Swimming',
  'Track & Field',
  'Other',
];

export function TeamEditModal({ open, name, sport, onClose, onSave, isSaving = false }: TeamEditModalProps) {
  const [formName, setFormName] = useState('');
  const [formSport, setFormSport] = useState('');

  useEffect(() => {
    if (open) {
      setFormName(name);
      setFormSport(sport);
    }
  }, [open, name, sport]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim() && formSport) {
      onSave({ name: formName.trim(), sport: formSport });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Team name..."
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sport
              </label>
              <select
                value={formSport}
                onChange={(e) => setFormSport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#356793] focus:border-transparent"
              >
                {sportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formName.trim() || !formSport || isSaving}
              className="bg-[#356793] hover:bg-[#2a5275]"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

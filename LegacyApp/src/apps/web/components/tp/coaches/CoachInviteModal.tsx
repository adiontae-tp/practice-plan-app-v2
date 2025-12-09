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
import { cn } from '@/lib/utils';

type Permission = 'admin' | 'edit' | 'view';

interface CoachAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (email: string, permission: Permission) => void;
}

export function CoachAddModal({ open, onClose, onAdd }: CoachAddModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('view');

  useEffect(() => {
    if (open) {
      setEmail('');
      setPermission('view');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onAdd(email.trim(), permission);
      onClose();
    }
  };

  const permissionOptions: { value: Permission; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'edit', label: 'Edit' },
    { value: 'view', label: 'View' },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Coach</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@example.com"
                autoFocus
                data-testid="coach-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission Level
              </label>
              <div className="flex gap-2">
                {permissionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPermission(option.value)}
                    className={cn(
                      'flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors',
                      permission === option.value
                        ? 'bg-[#356793] text-white border-[#356793]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!email.trim()}
              className="bg-[#356793] hover:bg-[#2a5275]"
              data-testid="save-coach"
            >
              Add Coach
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

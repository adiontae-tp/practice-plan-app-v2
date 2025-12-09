'use client';

import { useState, useEffect } from 'react';
import { Coach, CoachPermission, CoachStatus } from '@ppa/interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CoachEditModalProps {
  open: boolean;
  coach: Coach | null;
  onClose: () => void;
  onSave: (coach: Coach, permission: CoachPermission, status: CoachStatus) => void;
}

export function CoachEditModal({ open, coach, onClose, onSave }: CoachEditModalProps) {
  const [permission, setPermission] = useState<CoachPermission>('view');
  const [status, setStatus] = useState<CoachStatus>('active');

  useEffect(() => {
    if (open && coach) {
      setPermission(coach.permission || 'view');
      setStatus(coach.status === 'invited' ? 'active' : (coach.status || 'active'));
    }
  }, [open, coach]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coach) {
      onSave(coach, permission, status);
      onClose();
    }
  };

  if (!coach) return null;

  const permissionOptions: { value: CoachPermission; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'edit', label: 'Edit' },
    { value: 'view', label: 'View' },
  ];

  const statusOptions: { value: CoachStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Coach</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900">{coach.email}</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={cn(
                      'flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors',
                      status === option.value
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
              className="bg-[#356793] hover:bg-[#2a5275]"
              data-testid="save-coach"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

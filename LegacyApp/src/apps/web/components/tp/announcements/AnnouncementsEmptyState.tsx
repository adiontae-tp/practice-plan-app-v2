'use client';

import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnnouncementsEmptyStateProps {
  onAdd: () => void;
}

export function AnnouncementsEmptyState({ onAdd }: AnnouncementsEmptyStateProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Bell className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements yet</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Keep your team informed by sending announcements about schedule changes, events, and important updates.
      </p>
      <Button onClick={onAdd} className="bg-[#356793] hover:bg-[#2a5275]" data-testid="add-announcement">
        <Plus className="w-4 h-4 mr-1" />
        Create First Announcement
      </Button>
    </div>
  );
}

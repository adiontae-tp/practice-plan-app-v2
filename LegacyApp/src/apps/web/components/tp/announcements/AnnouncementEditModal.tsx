'use client';

import { useState, useEffect } from 'react';
import { Announcement, AnnouncementPriority, NotificationOptions } from '@ppa/interfaces';
import { Bell, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface AnnouncementEditModalProps {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onSave: (
    announcement: Announcement,
    data: {
      title: string;
      message: string;
      priority: AnnouncementPriority;
      notificationOptions?: NotificationOptions;
    }
  ) => void;
}

const priorityOptions: { value: AnnouncementPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function AnnouncementEditModal({ open, announcement, onClose, onSave }: AnnouncementEditModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('medium');
  const [resendNotifications, setResendNotifications] = useState(false);
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    if (open && announcement) {
      setTitle(announcement.title);
      setMessage(announcement.message);
      setPriority(announcement.priority);
      setResendNotifications(false);
      setSendPush(true);
      setSendEmail(false);
    }
  }, [open, announcement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (announcement && title.trim() && message.trim()) {
      onSave(announcement, {
        title: title.trim(),
        message: message.trim(),
        priority,
        notificationOptions: resendNotifications
          ? { sendPush, sendEmail }
          : undefined,
      });
    }
  };

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title..."
                autoFocus
                data-testid="announcement-title-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#356793] focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      priority === option.value
                        ? 'bg-[#356793] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Resend Notifications
                </label>
                <Switch
                  checked={resendNotifications}
                  onCheckedChange={setResendNotifications}
                />
              </div>
              {resendNotifications && (
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Push Notification</span>
                    </div>
                    <Switch
                      checked={sendPush}
                      onCheckedChange={setSendPush}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Email</span>
                    </div>
                    <Switch
                      checked={sendEmail}
                      onCheckedChange={setSendEmail}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !message.trim()}
              className="bg-[#356793] hover:bg-[#2a5275]"
              data-testid="save-announcement"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

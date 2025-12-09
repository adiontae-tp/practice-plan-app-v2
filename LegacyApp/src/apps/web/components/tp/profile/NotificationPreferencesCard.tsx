'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { updateNotificationPreferences } from '@ppa/firebase';
import { useNotificationPermission } from '@/components/providers/NotificationProvider';

interface NotificationPreferencesCardProps {
  userId: string;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  hasPushToken?: boolean;
}

export function NotificationPreferencesCard({
  userId,
  pushEnabled = true,
  emailEnabled = true,
  hasPushToken = false,
}: NotificationPreferencesCardProps) {
  const [localPushEnabled, setLocalPushEnabled] = useState(pushEnabled);
  const [localEmailEnabled, setLocalEmailEnabled] = useState(emailEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | null>(null);
  const { requestPermission } = useNotificationPermission();

  // Sync local state with props when they change
  useEffect(() => {
    setLocalPushEnabled(pushEnabled);
  }, [pushEnabled]);

  useEffect(() => {
    setLocalEmailEnabled(emailEnabled);
  }, [emailEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && browserPermission !== 'granted') {
      setIsEnablingPush(true);
      try {
        const success = await requestPermission();
        if (success) {
          setBrowserPermission('granted');
          setLocalPushEnabled(true);
          await updateNotificationPreferences(userId, { pushEnabled: true });
        }
      } catch (error) {
        console.error('Failed to enable push notifications:', error);
      } finally {
        setIsEnablingPush(false);
      }
      return;
    }

    setLocalPushEnabled(enabled);
    setIsSaving(true);
    try {
      await updateNotificationPreferences(userId, { pushEnabled: enabled });
    } catch (error) {
      console.error('Failed to update push preference:', error);
      setLocalPushEnabled(!enabled);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailToggle = async (enabled: boolean) => {
    setLocalEmailEnabled(enabled);
    setIsSaving(true);
    try {
      await updateNotificationPreferences(userId, { emailEnabled: enabled });
    } catch (error) {
      console.error('Failed to update email preference:', error);
      setLocalEmailEnabled(!enabled);
    } finally {
      setIsSaving(false);
    }
  };

  const showEnablePushButton = browserPermission !== 'granted' && !localPushEnabled;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">Notification Preferences</h3>
        {isSaving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-500" />
            <div>
              <span className="text-sm font-medium text-gray-900">Push Notifications</span>
              <p className="text-xs text-gray-500">
                {browserPermission === 'denied'
                  ? 'Blocked in browser settings'
                  : browserPermission === 'granted'
                  ? 'Receive instant notifications'
                  : 'Enable to receive instant notifications'}
              </p>
            </div>
          </div>
          {showEnablePushButton ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePushToggle(true)}
              disabled={isEnablingPush || browserPermission === 'denied'}
            >
              {isEnablingPush ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              {browserPermission === 'denied' ? 'Blocked' : 'Enable'}
            </Button>
          ) : (
            <Switch
              checked={localPushEnabled}
              onCheckedChange={handlePushToggle}
              disabled={isSaving || browserPermission === 'denied'}
            />
          )}
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <span className="text-sm font-medium text-gray-900">Email Notifications</span>
              <p className="text-xs text-gray-500">Receive notifications via email</p>
            </div>
          </div>
          <Switch
            checked={localEmailEnabled}
            onCheckedChange={handleEmailToggle}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

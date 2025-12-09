'use client';

import { useState, useEffect } from 'react';
import { Plan } from '@ppa/interfaces';
import { enablePlanSharing, disablePlanSharing } from '@ppa/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, Copy, Check, Mail, MessageSquare, Share2, Loader2 } from 'lucide-react';

interface PlanShareModalProps {
  open: boolean;
  onClose: () => void;
  plan: Plan | null;
  teamId: string | undefined;
}

function formatPlanDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPlanTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function PlanShareModal({ open, onClose, plan, teamId }: PlanShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (open && plan) {
      setIsEnabled(!!plan.shareEnabled);
      if (plan.shareToken && plan.shareEnabled) {
        setShareUrl(`${window.location.origin}/share/${plan.shareToken}`);
      } else {
        setShareUrl(null);
      }
    }
  }, [open, plan]);

  const handleEnableSharing = async () => {
    if (!plan || !teamId) return;
    setIsLoading(true);
    try {
      const token = await enablePlanSharing(teamId, plan.id);
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
      setIsEnabled(true);
    } catch (error) {
      console.error('Failed to enable sharing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableSharing = async () => {
    if (!plan || !teamId) return;
    setIsLoading(true);
    try {
      await disablePlanSharing(teamId, plan.id);
      setShareUrl(null);
      setIsEnabled(false);
    } catch (error) {
      console.error('Failed to disable sharing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    if (!shareUrl || !plan) return;
    const subject = encodeURIComponent(`Practice Plan - ${formatPlanDate(plan.startTime)}`);
    const body = encodeURIComponent(
      `Check out this practice plan:\n\n${formatPlanDate(plan.startTime)} at ${formatPlanTime(plan.startTime)}\n\n${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSms = () => {
    if (!shareUrl || !plan) return;
    const body = encodeURIComponent(
      `Practice Plan - ${formatPlanDate(plan.startTime)}: ${shareUrl}`
    );
    window.open(`sms:?body=${body}`);
  };

  const shareNative = async () => {
    if (!shareUrl || !plan) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Practice Plan - ${formatPlanDate(plan.startTime)}`,
          text: `Check out this practice plan for ${formatPlanDate(plan.startTime)}`,
          url: shareUrl,
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Practice Plan
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">{formatPlanDate(plan.startTime)}</p>
            <p>{formatPlanTime(plan.startTime)} - {formatPlanTime(plan.endTime)}</p>
          </div>

          {!isEnabled ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enable sharing to create a public link for this practice plan. Anyone with the link can view the plan.
              </p>
              <Button
                onClick={handleEnableSharing}
                disabled={isLoading}
                className="w-full bg-[#356793] hover:bg-[#2a5275]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Enable Sharing
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl || ''}
                    readOnly
                    className="flex-1 text-sm bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Share via</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={shareViaEmail}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-xs">Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={shareViaSms}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs">Message</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={shareNative}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-xs">More</span>
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={handleDisableSharing}
                  disabled={isLoading}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isLoading ? 'Disabling...' : 'Disable Sharing'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

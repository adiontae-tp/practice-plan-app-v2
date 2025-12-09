'use client';

import { useState } from 'react';
import { FileShare, SharePermission } from '@ppa/interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, Copy, Check, Trash2, Lock, Eye, Download, Edit3, Users, Calendar } from 'lucide-react';

interface FileShareModalProps {
  open: boolean;
  onClose: () => void;
  shares: FileShare[];
  onCreateLink: (permission: SharePermission, expiresAt?: number, password?: string) => Promise<FileShare>;
  onDeleteShare: (shareId: string) => Promise<void>;
  isLoading?: boolean;
  isCreating?: boolean;
  fileName?: string;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const permissionLabels: Record<SharePermission, { label: string; icon: React.ReactNode }> = {
  view: { label: 'View only', icon: <Eye className="w-4 h-4" /> },
  download: { label: 'Can download', icon: <Download className="w-4 h-4" /> },
  edit: { label: 'Can edit', icon: <Edit3 className="w-4 h-4" /> },
};

export function FileShareModal({
  open,
  onClose,
  shares,
  onCreateLink,
  onDeleteShare,
  isLoading = false,
  isCreating = false,
  fileName,
}: FileShareModalProps) {
  const [permission, setPermission] = useState<SharePermission>('view');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateLink = async () => {
    const expiresAt = hasExpiry ? Date.now() + expiryDays * 24 * 60 * 60 * 1000 : undefined;
    const sharePassword = hasPassword && password.trim() ? password.trim() : undefined;
    await onCreateLink(permission, expiresAt, sharePassword);
    setPassword('');
    setHasPassword(false);
  };

  const copyToClipboard = async (shareId: string) => {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const linkShares = shares.filter((s) => s.type === 'link');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Share File
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {fileName && (
            <p className="text-sm text-gray-500">
              Sharing: <span className="font-medium text-gray-700">{fileName}</span>
            </p>
          )}

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Create Share Link</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permission</label>
              <div className="flex gap-2">
                {(['view', 'download'] as SharePermission[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPermission(p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                      permission === p
                        ? 'border-[#356793] bg-blue-50 text-[#356793]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {permissionLabels[p].icon}
                    {permissionLabels[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExpiry}
                  onChange={(e) => setHasExpiry(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Set expiration</span>
              </label>
              {hasExpiry && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20"
                    min={1}
                  />
                  <span className="text-sm text-gray-500">days</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPassword}
                  onChange={(e) => setHasPassword(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Password protect</span>
              </label>
              {hasPassword && (
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="mt-2"
                />
              )}
            </div>

            <Button
              onClick={handleCreateLink}
              disabled={isCreating || (hasPassword && !password.trim())}
              className="w-full bg-[#356793] hover:bg-[#2a5275]"
            >
              {isCreating ? 'Creating...' : 'Create Link'}
            </Button>
          </div>

          {linkShares.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Active Links</h3>
              <div className="space-y-2">
                {linkShares.map((share) => {
                  const isExpired = Boolean(share.expiresAt && share.expiresAt < Date.now());
                  return (
                    <div
                      key={share.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isExpired ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          {permissionLabels[share.permission].icon}
                          <span className="text-gray-700">{permissionLabels[share.permission].label}</span>
                          {share.password && <Lock className="w-3 h-3 text-gray-400" />}
                          {isExpired && (
                            <span className="text-xs text-red-600 font-medium">Expired</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{share.accessCount} views</span>
                          {share.expiresAt && !isExpired && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Expires {formatDate(share.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(share.id)}
                          className="h-8 w-8 p-0"
                          disabled={isExpired}
                        >
                          {copiedId === share.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteShare(share.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

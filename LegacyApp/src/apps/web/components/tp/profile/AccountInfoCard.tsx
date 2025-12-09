'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface AccountInfoCardProps {
  email: string;
  uid: string;
  createdAt: number;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AccountInfoCard({ email, uid, createdAt }: AccountInfoCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Account Information</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Email</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{email}</span>
            <button
              onClick={() => handleCopy(email, 'email')}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              {copiedField === 'email' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">User ID</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-900">{uid}</span>
            <button
              onClick={() => handleCopy(uid, 'uid')}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              {copiedField === 'uid' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600">Member Since</span>
          <span className="text-sm text-gray-900">{formatDate(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

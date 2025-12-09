'use client';

import { useState } from 'react';
import { Copy, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeamInfoCardProps {
  name: string;
  sport: string;
  teamId: string;
  canEdit: boolean;
  onEdit: () => void;
}

export function TeamInfoCard({ name, sport, teamId, canEdit, onEdit }: TeamInfoCardProps) {
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">Team Information</h3>
        {canEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Team Name</span>
          <span className="text-sm font-medium text-gray-900">{name}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Sport</span>
          <span className="text-sm font-medium text-gray-900">{sport}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600">Team ID</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-900">{teamId}</span>
            <button
              onClick={() => handleCopy(teamId, 'teamId')}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              {copiedField === 'teamId' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

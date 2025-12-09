'use client';

import { Info } from 'lucide-react';

interface InfoBoxProps {
  title?: string;
  message: string;
}

export function InfoBox({ title, message }: InfoBoxProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
      <div className="flex gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          {title && <p className="font-medium text-blue-900 mb-1">{title}</p>}
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      </div>
    </div>
  );
}

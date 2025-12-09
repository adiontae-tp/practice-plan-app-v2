'use client';

import { ReportTab } from '@ppa/store';

interface ReportsTabSelectorProps {
  activeTab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
}

export function ReportsTabSelector({ activeTab, onTabChange }: ReportsTabSelectorProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      <button
        onClick={() => onTabChange('periods')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'periods'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Period Usage
      </button>
      <button
        onClick={() => onTabChange('tags')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'tags'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Tag Usage
      </button>
    </div>
  );
}

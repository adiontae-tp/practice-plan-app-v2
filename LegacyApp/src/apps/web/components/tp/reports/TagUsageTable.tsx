'use client';

import { Tag } from 'lucide-react';

interface TagUsageData {
  name: string;
  timesUsed: number;
  percentage: number;
}

interface TagUsageTableProps {
  data: TagUsageData[];
}

export function TagUsageTable({ data }: TagUsageTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <p className="text-gray-500">No tag usage data available for this time range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Mobile List View */}
      <div className="md:hidden divide-y divide-gray-200">
        {data.map((item) => (
          <div key={item.name} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
              </div>
              <span className="text-sm text-gray-500">{item.timesUsed}x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#356793] rounded-full"
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="bg-gradient-to-r from-[#356793] to-[#2d5578]">
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white">Tag Name</th>
            <th className="px-5 py-3.5 text-right text-sm font-bold text-white w-28">Times Used</th>
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white w-48">% of Activities</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name} className="border-b border-gray-200">
              <td className="px-5 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {item.name}
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-gray-600 text-right">{item.timesUsed}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#356793] rounded-full"
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

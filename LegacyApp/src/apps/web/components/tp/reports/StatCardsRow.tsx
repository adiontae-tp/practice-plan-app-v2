'use client';

import { Calendar, Clock, Layers, Tag } from 'lucide-react';

interface StatCardsRowProps {
  totalPractices: number;
  totalHours: number;
  uniquePeriods: number;
  uniqueTags: number;
}

export function StatCardsRow({
  totalPractices,
  totalHours,
  uniquePeriods,
  uniqueTags,
}: StatCardsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Practices"
        value={String(totalPractices)}
        icon={<Calendar className="w-5 h-5" />}
      />
      <StatCard
        label="Total Hours"
        value={totalHours.toFixed(1)}
        icon={<Clock className="w-5 h-5" />}
      />
      <StatCard
        label="Unique Periods"
        value={String(uniquePeriods)}
        icon={<Layers className="w-5 h-5" />}
      />
      <StatCard
        label="Unique Tags"
        value={String(uniqueTags)}
        icon={<Tag className="w-5 h-5" />}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Coach } from '@ppa/interfaces';
import { X, Search, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionBadge } from './PermissionBadge';
import { StatusBadge } from './StatusBadge';

export interface CoachesDesktopTableProps {
  coaches: Coach[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showStatus?: boolean;
  onRowClick: (coach: Coach) => void;
  onDelete: (coach: Coach) => void;
  onAdd: () => void;
}

export function CoachesDesktopTable({
  coaches,
  totalCount,
  searchQuery,
  onSearchChange,
  showStatus = false,
  onRowClick,
  onDelete,
  onAdd,
}: CoachesDesktopTableProps) {
  const isEmpty = coaches.length === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Coaches</h2>
          <span className="text-sm text-gray-500">({totalCount})</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by email..."
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button
            onClick={onAdd}
            className="bg-[#356793] hover:bg-[#2a5275]"
            data-testid="add-coach"
          >
            <Plus className="w-4 h-4 mr-1" />
            Invite Coach
          </Button>
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden">
        {isEmpty ? (
          <div className="px-4 py-12 text-center text-gray-500">
            {searchQuery ? `No coaches found matching "${searchQuery}"` : 'No coaches yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                onClick={() => onRowClick(coach)}
                className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{coach.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <PermissionBadge permission={coach.permission || 'view'} />
                    {showStatus && <StatusBadge status={coach.status || 'invited'} />}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(coach);
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    data-testid="delete-coach"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="bg-gradient-to-r from-[#356793] to-[#2d5578]">
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white">Email</th>
            <th className="w-32 px-5 py-3.5 text-center text-sm font-bold text-white">Permission</th>
            {showStatus && (
              <th className="w-28 px-5 py-3.5 text-center text-sm font-bold text-white">Status</th>
            )}
            <th className="w-20 px-5 py-3.5 text-center text-sm font-bold text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={showStatus ? 4 : 3} className="px-5 py-12 text-center text-gray-500">
                {searchQuery ? `No coaches found matching "${searchQuery}"` : 'No coaches yet'}
              </td>
            </tr>
          ) : (
            coaches.map((coach) => (
              <tr
                key={coach.id}
                onClick={() => onRowClick(coach)}
                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-4 text-sm text-gray-900">{coach.email}</td>
                <td className="px-5 py-4 text-center">
                  <PermissionBadge permission={coach.permission || 'view'} />
                </td>
                {showStatus && (
                  <td className="px-5 py-4 text-center">
                    <StatusBadge status={coach.status || 'invited'} />
                  </td>
                )}
                <td className="px-5 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(coach);
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    data-testid="delete-coach"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

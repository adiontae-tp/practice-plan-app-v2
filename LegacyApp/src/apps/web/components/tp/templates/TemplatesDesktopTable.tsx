'use client';

import { Template } from '@ppa/interfaces';
import { X, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface TemplatesDesktopTableProps {
  templates: Template[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick: (template: Template) => void;
  onDelete: (template: Template) => void;
  onAdd: () => void;
}

/**
 * TemplatesDesktopTable - Desktop table view for templates
 *
 * Uses shadcn components for desktop experience
 * Displays templates in a sortable table with search and actions
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function TemplatesDesktopTable({
  templates,
  totalCount,
  searchQuery,
  onSearchChange,
  onRowClick,
  onDelete,
  onAdd,
}: TemplatesDesktopTableProps) {
  const isEmpty = templates.length === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Practice Templates</h2>
          <span className="text-sm text-gray-500">({totalCount})</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search templates..."
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button
            onClick={onAdd}
            className="bg-[#356793] hover:bg-[#2a5275]"
            data-testid="add-template"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Template
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-[#356793] to-[#2d5578]">
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white">Name</th>
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white w-28">Duration</th>
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white w-28">Periods</th>
            <th className="w-20 px-5 py-3.5 text-center text-sm font-bold text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={4} className="px-5 py-12 text-center text-gray-500">
                {searchQuery ? `No templates found matching "${searchQuery}"` : 'No templates yet'}
              </td>
            </tr>
          ) : (
            templates.map((template) => (
              <tr
                key={template.id}
                onClick={() => onRowClick(template)}
                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-4 text-sm text-gray-900">{template.name}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{formatDuration(template.duration)}</td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  {template.activities.length} {template.activities.length === 1 ? 'period' : 'periods'}
                </td>
                <td className="px-5 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(template);
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    data-testid="delete-template-row"
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

// Legacy export for backwards compatibility
export { TemplatesDesktopTable as TemplatesTable };

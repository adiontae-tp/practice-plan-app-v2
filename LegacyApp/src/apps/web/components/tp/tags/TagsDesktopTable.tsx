'use client';

import { Tag } from '@ppa/interfaces';
import { X, Search, Plus, ChevronRight, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface TagsDesktopTableProps {
  tags: Tag[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onAdd: () => void;
}

export function TagsDesktopTable({
  tags,
  totalCount,
  searchQuery,
  onSearchChange,
  onRowClick,
  onDelete,
  onAdd,
}: TagsDesktopTableProps) {
  const isEmpty = tags.length === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
          <span className="text-sm text-gray-500">({totalCount})</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tags..."
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button
            onClick={onAdd}
            className="bg-[#356793] hover:bg-[#2a5275]"
            data-testid="add-tag"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Tag
          </Button>
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden">
        {isEmpty ? (
          <div className="px-4 py-12 text-center text-gray-500">
            {searchQuery ? `No tags found matching "${searchQuery}"` : 'No tags yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tags.map((tag) => (
              <div
                key={tag.id}
                onClick={() => onRowClick(tag)}
                className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <TagIcon className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{tag.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tag);
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    data-testid="delete-tag"
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
            <th className="px-5 py-3.5 text-left text-sm font-bold text-white">Name</th>
            <th className="w-20 px-5 py-3.5 text-center text-sm font-bold text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={2} className="px-5 py-12 text-center text-gray-500">
                {searchQuery ? `No tags found matching "${searchQuery}"` : 'No tags yet'}
              </td>
            </tr>
          ) : (
            tags.map((tag) => (
              <tr
                key={tag.id}
                onClick={() => onRowClick(tag)}
                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-4 text-sm text-gray-900">{tag.name}</td>
                <td className="px-5 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tag);
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    data-testid="delete-tag"
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

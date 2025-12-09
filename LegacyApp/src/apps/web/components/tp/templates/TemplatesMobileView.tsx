'use client';

import { Template } from '@ppa/interfaces';
import {
  MWCard,
  MWCardList,
  MWCardIcon,
  MWSearchBar,
  MWPageContent
} from '@ppa/mobile-web';
import { FileText, Search, ChevronRight, X } from 'lucide-react';
import { TPFooterButtons } from '@/components/tp';

export interface TemplatesMobileViewProps {
  templates: Template[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick: (template: Template) => void;
  onDelete: (template: Template) => void;
  onAdd: () => void;
  loading?: boolean;
}

/**
 * TemplatesMobileView - Mobile-optimized view for templates
 *
 * Matches mobile app pattern:
 * - White SearchBar
 * - Individual white cards (not grouped list)
 * - TPFooterButtons at bottom
 * - Proper empty/loading states
 *
 * Displays:
 * - Template name
 * - Duration (formatted)
 * - Periods count from activities array
 */
export function TemplatesMobileView({
  templates,
  totalCount,
  searchQuery,
  onSearchChange,
  onRowClick,
  onDelete,
  onAdd,
  loading = false,
}: TemplatesMobileViewProps) {
  const isEmpty = templates.length === 0;
  const hasSearchQuery = searchQuery.length > 0;

  // Format duration helper (same as desktop)
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <MWPageContent>
          <div className="flex flex-col gap-4 pb-24">
            {/* Search */}
            <MWSearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search templates..."
            />

            {/* Content */}
            {loading ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#356793] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500">Loading templates...</p>
              </div>
            ) : totalCount === 0 ? (
              // Empty state - no templates at all
              <div className="flex flex-col items-center justify-center py-20">
                <MWCardIcon color="gray" size="lg">
                  <FileText className="w-8 h-8" />
                </MWCardIcon>
                <h3 className="text-lg font-semibold text-gray-700 mt-4">
                  No templates yet
                </h3>
                <p className="text-sm text-gray-500 mt-1 text-center px-8">
                  Create your first practice template to get started
                </p>
              </div>
            ) : isEmpty && hasSearchQuery ? (
              // Empty search results
              <div className="flex flex-col items-center justify-center py-20">
                <MWCardIcon color="gray" size="lg">
                  <Search className="w-8 h-8" />
                </MWCardIcon>
                <h3 className="text-lg font-semibold text-gray-700 mt-4">
                  No results found
                </h3>
                <p className="text-sm text-gray-500 mt-1 text-center px-8">
                  Try a different search term
                </p>
              </div>
            ) : (
              // Templates list
              <MWCardList
                count={templates.length}
                singularLabel="Template"
                pluralLabel="Templates"
              >
                {templates.map((template) => {
                  // Build subtitle with duration and periods count
                  const duration = formatDuration(template.duration);
                  const periodCount = template.activities.length;
                  const subtitle = `${duration} • ${periodCount} period${periodCount !== 1 ? 's' : ''}`;

                  return (
                    <MWCard
                      key={template.id}
                      onPress={() => onRowClick(template)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <MWCardIcon color="blue">
                          <FileText className="w-5 h-5" />
                        </MWCardIcon>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-gray-900 truncate">
                            {template.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {subtitle}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(template);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label={`Delete ${template.name}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </MWCard>
                  );
                })}
              </MWCardList>
            )}
          </div>
        </MWPageContent>
      </div>

      {/* Footer Buttons */}
      <TPFooterButtons
        mode="view"
        onCancel={() => window.history.back()}
        onEdit={onAdd}
        cancelLabel="Close"
        editLabel="Add Template"
        canEdit={true}
      />
    </div>
  );
}

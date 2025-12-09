'use client';

import { Period } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import {
  MWCard,
  MWCardList,
  MWCardIcon,
  MWSearchBar,
  MWPageContent
} from '@ppa/mobile-web';
import { Clock, Search, ChevronRight, X } from 'lucide-react';
import { TPFooterButtons } from '@/components/tp';

export interface PeriodsMobileViewProps {
  periods: Period[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick: (period: Period) => void;
  onDelete: (period: Period) => void;
  onAdd: () => void;
  loading?: boolean;
}

/**
 * PeriodsMobileView - Mobile-optimized view for periods
 *
 * Matches mobile app pattern:
 * - White SearchBar
 * - Individual white cards (not grouped list)
 * - TPFooterButtons at bottom
 * - Proper empty/loading states
 */
export function PeriodsMobileView({
  periods,
  totalCount,
  searchQuery,
  onSearchChange,
  onRowClick,
  onDelete,
  onAdd,
  loading = false,
}: PeriodsMobileViewProps) {
  // Get tags from store for display
  const tags = useAppStore((state) => state.tags);

  const isEmpty = periods.length === 0;
  const hasSearchQuery = searchQuery.length > 0;

  const getTagName = (tagId: string): string => {
    const tag = tags.find((t) => t.id === tagId);
    return tag?.name || tagId;
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
              placeholder="Search periods..."
            />

            {/* Content */}
            {loading ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#356793] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500">Loading periods...</p>
              </div>
            ) : totalCount === 0 ? (
              // Empty state - no periods at all
              <div className="flex flex-col items-center justify-center py-20">
                <MWCardIcon color="gray" size="lg">
                  <Clock className="w-8 h-8" />
                </MWCardIcon>
                <h3 className="text-lg font-semibold text-gray-700 mt-4">
                  No periods yet
                </h3>
                <p className="text-sm text-gray-500 mt-1 text-center px-8">
                  Create your first period template to get started
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
              // Periods list
              <MWCardList
                count={periods.length}
                singularLabel="Period"
                pluralLabel="Periods"
              >
                {periods.map((period) => {
                  // Build subtitle with duration and tags
                  const duration = period.duration;
                  const tagCount = period.tags?.length || 0;
                  const subtitle =
                    tagCount > 0
                      ? `${duration} min • ${tagCount} tag${tagCount !== 1 ? 's' : ''}`
                      : `${duration} min`;

                  return (
                    <MWCard
                      key={period.id}
                      onPress={() => onRowClick(period)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <MWCardIcon color="blue">
                          <Clock className="w-5 h-5" />
                        </MWCardIcon>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-gray-900 truncate">
                            {period.name}
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
                              onDelete(period);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label={`Delete ${period.name}`}
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
        editLabel="Add Period"
        canEdit={true}
      />
    </div>
  );
}

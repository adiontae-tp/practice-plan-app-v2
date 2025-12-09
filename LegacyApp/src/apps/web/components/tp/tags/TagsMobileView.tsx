'use client';

import { Tag } from '@ppa/interfaces';
import {
  MWCard,
  MWCardList,
  MWCardIcon,
  MWSearchBar,
  MWPageContent
} from '@ppa/mobile-web';
import { Tag as TagIcon, Search, ChevronRight } from 'lucide-react';
import { TPFooterButtons } from '@/components/tp';

export interface TagsMobileViewProps {
  tags: Tag[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick: (tag: Tag) => void;
  onAdd: () => void;
  loading?: boolean;
}

/**
 * TagsMobileView - Mobile-optimized view for tags
 *
 * Matches mobile app pattern exactly:
 * - White SearchBar
 * - Individual white cards with tag icon
 * - TPFooterButtons at bottom (Close / Add Tag)
 * - Proper empty/loading states
 */
export function TagsMobileView({
  tags,
  totalCount,
  searchQuery,
  onSearchChange,
  onRowClick,
  onAdd,
  loading = false,
}: TagsMobileViewProps) {
  const isEmpty = tags.length === 0;
  const hasSearchQuery = searchQuery.length > 0;

  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <MWPageContent>
          <div className="flex flex-col gap-4 pb-24">
            {/* Search */}
            <MWSearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search tags..."
            />

            {/* Content */}
            {loading ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#356793] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500">Loading tags...</p>
              </div>
            ) : totalCount === 0 ? (
              // Empty state - no tags at all
              <div className="flex flex-col items-center justify-center py-20">
                <MWCardIcon color="gray" size="lg">
                  <TagIcon className="w-8 h-8" />
                </MWCardIcon>
                <h3 className="text-lg font-semibold text-gray-700 mt-4">
                  No tags yet
                </h3>
                <p className="text-sm text-gray-500 mt-1 text-center px-8">
                  Create your first tag to organize activities
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
              // Tags list
              <MWCardList
                count={tags.length}
                singularLabel="Tag"
                pluralLabel="Tags"
              >
                {tags.map((tag) => (
                  <MWCard
                    key={tag.id}
                    onPress={() => onRowClick(tag)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <MWCardIcon color="gray">
                        <TagIcon className="w-5 h-5" />
                      </MWCardIcon>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 truncate">
                          {tag.name}
                        </p>
                      </div>

                      {/* Chevron */}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </MWCard>
                ))}
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
        editLabel="Add Tag"
        canEdit={true}
      />
    </div>
  );
}

'use client';

import { Coach } from '@ppa/interfaces';
import {
  MWCard,
  MWCardList,
  MWCardIcon,
  MWSearchBar,
  MWPageContent
} from '@ppa/mobile-web';
import { Users, Search, Mail, ChevronRight } from 'lucide-react';
import { TPFooterButtons } from '@/components/tp';

export interface CoachesMobileViewProps {
  coaches: Coach[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick: (coach: Coach) => void;
  onAdd: () => void;
  loading?: boolean;
  canAdd?: boolean;
}

/**
 * CoachesMobileView - Mobile-optimized view for coaches
 *
 * Matches mobile app pattern:
 * - White SearchBar
 * - Individual white cards with avatar + name + email + permission badge
 * - TPFooterButtons at bottom (Close / Add Coach)
 * - Subscription gating for add button
 * - Proper empty/loading states
 */
export function CoachesMobileView({
  coaches,
  totalCount,
  searchQuery,
  onSearchChange,
  onRowClick,
  onAdd,
  loading = false,
  canAdd = true,
}: CoachesMobileViewProps) {
  const isEmpty = coaches.length === 0;
  const hasSearchQuery = searchQuery.length > 0;

  // Generate display name and initials from email
  const getDisplayInfo = (email: string) => {
    const displayName = email
      .split('@')[0]
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const initials = displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return { displayName, initials };
  };

  // Permission badge styles
  const getPermissionBadge = (permission?: string) => {
    const labels = { admin: 'Admin', edit: 'Edit', view: 'View' };
    const label = permission ? labels[permission as keyof typeof labels] || 'View' : 'View';

    return (
      <span className="bg-gray-300 rounded-full px-3 py-1 text-xs font-semibold text-gray-800">
        {label}
      </span>
    );
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
              placeholder="Search by email or permission..."
            />

            {/* Content */}
            {loading ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#356793] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500">Loading coaches...</p>
              </div>
            ) : totalCount === 0 ? (
              // Empty state - no coaches at all
              <div className="flex flex-col items-center justify-center py-20">
                <MWCardIcon color="gray" size="lg">
                  <Users className="w-8 h-8" />
                </MWCardIcon>
                <h3 className="text-lg font-semibold text-gray-700 mt-4">
                  No coaches yet
                </h3>
                <p className="text-sm text-gray-500 mt-1 text-center px-8">
                  Invite coaches to help manage your team
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
              // Coaches list
              <MWCardList
                count={coaches.length}
                singularLabel="Coach"
                pluralLabel="Coaches"
              >
                {coaches.map((coach) => {
                  const { displayName, initials } = getDisplayInfo(coach.email);

                  return (
                    <MWCard
                      key={coach.id}
                      onPress={() => onRowClick(coach)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-[#356793] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-base">
                            {initials}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-gray-900 truncate">
                            {displayName}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <p className="text-sm text-gray-500 truncate">
                              {coach.email}
                            </p>
                          </div>
                        </div>

                        {/* Permission Badge + Chevron */}
                        <div className="flex items-center gap-2">
                          {getPermissionBadge(coach.permission)}
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
        editLabel="Add Coach"
        canEdit={canAdd}
      />
    </div>
  );
}

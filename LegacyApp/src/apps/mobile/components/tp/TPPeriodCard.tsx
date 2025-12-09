import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FileText, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react-native';
import { TPCard } from './TPCard';
import { TPTag } from './TPTag';
import type { Period, Tag } from '@ppa/interfaces';

export interface TPPeriodCardProps {
  /** The period data to display */
  period: Period;
  /** Optional callback when card is pressed */
  onPress?: () => void;
  /** Whether in edit mode - shows reorder controls */
  isEditMode?: boolean;
  /** Index for reordering (required if isEditMode) */
  index?: number;
  /** Total count of items (required if isEditMode) */
  totalCount?: number;
  /** Show notes indicator */
  showNotesIndicator?: boolean;
  /** Callback when notes icon is pressed */
  onViewNotes?: () => void;
  /** Callback to move item up */
  onMoveUp?: () => void;
  /** Callback to move item down */
  onMoveDown?: () => void;
  /** Callback to delete item */
  onDelete?: () => void;
}

/**
 * TPPeriodCard - Reusable period/activity card component
 * Displays period name, duration, tags, and optional notes indicator
 * Supports edit mode with reorder controls and delete button
 */
export const TPPeriodCard = ({
  period,
  onPress,
  isEditMode = false,
  index = 0,
  totalCount = 1,
  showNotesIndicator = true,
  onViewNotes,
  onMoveUp,
  onMoveDown,
  onDelete,
}: TPPeriodCardProps) => {
  const tags = period.tags as Tag[] | string[] | undefined;
  const canMoveUp = isEditMode && index > 0;
  const canMoveDown = isEditMode && index < totalCount - 1;
  const hasNotes = period.notes && period.notes.trim().length > 0;

  return (
    <TPCard onPress={onPress}>
      <View className="flex-row items-start gap-2">
        {/* Drag Handle / Reorder Controls (Edit Mode Only) */}
        {isEditMode && (
          <View className="flex-col items-center justify-center gap-1 pt-1">
            {canMoveUp && (
              <Pressable
                onPress={onMoveUp}
                hitSlop={{ top: 8, bottom: 4, left: 8, right: 8 }}
              >
                <ChevronUp size={16} color="#666666" />
              </Pressable>
            )}
            <GripVertical size={16} color="#999999" />
            {canMoveDown && (
              <Pressable
                onPress={onMoveDown}
                hitSlop={{ top: 4, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronDown size={16} color="#666666" />
              </Pressable>
            )}
          </View>
        )}

        {/* Period Content */}
        <View className="flex-1">
          {/* Period Header - Name with Notes Icon and Delete */}
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-base font-bold text-gray-900 flex-1 mr-2">
              {period.name}
            </Text>

            <View className="flex-row items-center gap-2">
              {/* Notes Icon Button */}
              {showNotesIndicator && hasNotes && onViewNotes && (
                <Pressable
                  onPress={onViewNotes}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FileText size={18} color="#666666" />
                </Pressable>
              )}

              {isEditMode && onDelete && (
                <Pressable onPress={onDelete}>
                  <Trash2 size={18} color="#ef4444" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Duration Row */}
          <Text className="text-sm font-semibold text-primary-500 mb-2">
            {period.duration} min
          </Text>

          {/* Tags - at bottom of card */}
          {tags && tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag, tagIndex) => {
                const tagLabel = typeof tag === 'string' ? tag : tag.name;
                const tagKey = typeof tag === 'string' ? `${tagIndex}` : tag.id;
                return <TPTag key={tagKey} label={tagLabel} />;
              })}
            </View>
          )}
        </View>
      </View>
    </TPCard>
  );
};

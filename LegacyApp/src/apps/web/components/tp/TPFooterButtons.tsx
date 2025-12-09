'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface TPFooterButtonsProps {
  /** Mode determines button labels and actions */
  mode?: 'view' | 'edit';
  /** Cancel/Close action */
  onCancel: () => void;
  /** Save action (edit mode only) */
  onSave?: () => void;
  /** Edit action (view mode only) */
  onEdit?: () => void;
  /** Label for save button */
  saveLabel?: string;
  /** Label for cancel button */
  cancelLabel?: string;
  /** Label for edit button */
  editLabel?: string;
  /** Shows loading spinner on primary button */
  loading?: boolean;
  /** Disables save button */
  saveDisabled?: boolean;
  /** Whether user can edit (view mode) */
  canEdit?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TPFooterButtons - Sticky footer with Cancel/Save or Close/Edit buttons
 * Matches mobile app pattern for consistent UX across platforms.
 *
 * @example
 * // Edit mode (forms)
 * <TPFooterButtons
 *   mode="edit"
 *   onCancel={handleCancel}
 *   onSave={handleSave}
 *   saveLabel="Create"
 *   loading={isSubmitting}
 * />
 *
 * @example
 * // View mode (detail screens)
 * <TPFooterButtons
 *   mode="view"
 *   onCancel={handleClose}
 *   onEdit={handleEdit}
 *   cancelLabel="Close"
 * />
 */
export function TPFooterButtons({
  mode = 'edit',
  onCancel,
  onSave,
  onEdit,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  editLabel = 'Edit',
  loading = false,
  saveDisabled = false,
  canEdit = true,
  className,
}: TPFooterButtonsProps) {
  const isPrimaryDisabled =
    mode === 'edit' ? loading || saveDisabled : !canEdit;

  const handlePrimaryPress = () => {
    if (mode === 'edit') {
      onSave?.();
    } else {
      onEdit?.();
    }
  };

  return (
    <div
      className={cn(
        'sticky bottom-0 left-0 right-0',
        'bg-white border-t border-gray-200',
        'px-4 py-3',
        'md:px-5',
        className
      )}
    >
      <div className="flex gap-3 max-w-2xl mx-auto">
        {/* Cancel/Close Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 h-14 text-lg font-semibold"
        >
          {cancelLabel}
        </Button>

        {/* Save/Edit Button */}
        <Button
          size="lg"
          onClick={handlePrimaryPress}
          disabled={isPrimaryDisabled}
          className={cn(
            'flex-1 h-14 text-lg font-semibold',
            isPrimaryDisabled
              ? 'bg-gray-300 text-gray-600 hover:bg-gray-300'
              : 'bg-[#356793] hover:bg-[#2a5275] text-white'
          )}
        >
          {loading && mode === 'edit' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            mode === 'edit' ? saveLabel : editLabel
          )}
        </Button>
      </div>
    </div>
  );
}

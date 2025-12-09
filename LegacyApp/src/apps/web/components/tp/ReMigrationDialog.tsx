'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@ppa/store';
import type { UserWithTeam } from '@ppa/store';
import { getOldUserUidByEmail, reMigrateUserData } from '@ppa/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export interface ReMigrationDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserWithTeam | null;
}

interface DataType {
  id: string;
  label: string;
  description: string;
}

const DATA_TYPES: DataType[] = [
  {
    id: 'plans',
    label: 'Plans',
    description: 'Practice plans with activities',
  },
  {
    id: 'periods',
    label: 'Period Templates',
    description: 'Reusable period templates',
  },
  {
    id: 'templates',
    label: 'Practice Templates',
    description: 'Full practice plan templates',
  },
  {
    id: 'tags',
    label: 'Tags',
    description: 'Practice and activity tags',
  },
  {
    id: 'coaches',
    label: 'Coaches',
    description: 'Team coaching staff',
  },
  {
    id: 'files',
    label: 'Files',
    description: 'Team files and documents',
  },
  {
    id: 'announcements',
    label: 'Announcements',
    description: 'Team announcements',
  },
];

export function ReMigrationDialog({ open, onClose, user }: ReMigrationDialogProps) {
  const {
    adminReMigrationLoading,
    adminReMigrationProgress,
    adminReMigrationError,
    setAdminReMigrationLoading,
    setAdminReMigrationProgress,
    setAdminReMigrationError,
  } = useAppStore();

  // Local state for checkbox selections (all selected by default)
  const [selectedDataTypes, setSelectedDataTypes] = useState<Set<string>>(
    new Set(DATA_TYPES.map((dt) => dt.id))
  );

  // Reset selections when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedDataTypes(new Set(DATA_TYPES.map((dt) => dt.id)));
      setAdminReMigrationError(null);
      setAdminReMigrationProgress(null);
    }
  }, [open, setAdminReMigrationError, setAdminReMigrationProgress]);

  const handleToggleDataType = (dataTypeId: string) => {
    setSelectedDataTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dataTypeId)) {
        newSet.delete(dataTypeId);
      } else {
        newSet.add(dataTypeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedDataTypes(new Set(DATA_TYPES.map((dt) => dt.id)));
  };

  const handleDeselectAll = () => {
    setSelectedDataTypes(new Set());
  };

  const handleReMigrate = async () => {
    if (!user) {
      setAdminReMigrationError('No user selected');
      return;
    }

    if (selectedDataTypes.size === 0) {
      setAdminReMigrationError('Please select at least one data type to re-migrate');
      return;
    }

    try {
      setAdminReMigrationLoading(true);
      setAdminReMigrationError(null);

      // Get old user UID by email
      const oldUid = await getOldUserUidByEmail(user.email);

      if (!oldUid) {
        setAdminReMigrationError('User not found in old project');
        setAdminReMigrationLoading(false);
        return;
      }

      // Convert Set to Array for the migration function
      const subcollections = Array.from(selectedDataTypes);

      // Call re-migration function with progress callback
      const result = await reMigrateUserData(oldUid, user.uid, subcollections, (progress) => {
        setAdminReMigrationProgress(progress);
      });

      setAdminReMigrationLoading(false);

      if (result.success) {
        toast.success('Re-migration completed successfully!', {
          description: `Migrated ${subcollections.length} data types`,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });

        // Auto-close dialog after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setAdminReMigrationError(result.error || 'Re-migration failed');
      }
    } catch (error) {
      console.error('Error during re-migration:', error);
      setAdminReMigrationError(error instanceof Error ? error.message : 'Unknown error occurred');
      setAdminReMigrationLoading(false);
    }
  };

  const progressPercentage = adminReMigrationProgress
    ? Math.round((adminReMigrationProgress.current / adminReMigrationProgress.total) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !adminReMigrationLoading && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Re-Migrate Data for {user?.fname} {user?.lname}
          </DialogTitle>
          <DialogDescription>
            Select the data types you want to re-migrate. This will overwrite existing data with data from the
            old project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Re-migration will replace existing data. This action cannot be undone.
            </p>
          </div>

          {/* Checkbox Section */}
          {!adminReMigrationLoading && (
            <>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="flex-1">
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll} className="flex-1">
                  Deselect All
                </Button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                {DATA_TYPES.map((dataType) => (
                  <div key={dataType.id} className="flex items-start gap-3">
                    <Checkbox
                      id={dataType.id}
                      checked={selectedDataTypes.has(dataType.id)}
                      onCheckedChange={() => handleToggleDataType(dataType.id)}
                    />
                    <label htmlFor={dataType.id} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm text-gray-900">{dataType.label}</div>
                      <div className="text-xs text-gray-500">{dataType.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Progress Section */}
          {adminReMigrationLoading && adminReMigrationProgress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{adminReMigrationProgress.step}</span>
                <span className="text-gray-500">
                  {adminReMigrationProgress.current}/{adminReMigrationProgress.total}
                </span>
              </div>
              <Progress value={progressPercentage} />
              <div className="text-xs text-gray-500 text-center">{progressPercentage}% complete</div>
            </div>
          )}

          {/* Error Display */}
          {adminReMigrationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{adminReMigrationError}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={adminReMigrationLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleReMigrate}
            disabled={adminReMigrationLoading || selectedDataTypes.size === 0}
            className="bg-[#356793] hover:bg-[#2a5276]"
          >
            {adminReMigrationLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Migrating...
              </>
            ) : (
              'Re-Migrate Selected'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

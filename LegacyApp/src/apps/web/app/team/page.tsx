'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@ppa/store';
import { uploadTeamLogo, deleteTeamLogo, uploadTeamFont, deleteTeamFont, deleteTeam, logout } from '@ppa/firebase';
import { CheckCircle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TeamInfoCard,
  TeamEditModal,
  TeamDeleteDialog,
  TeamPageSkeleton,
  TeamBrandingCard,
} from '@/components/tp/team';
import { useSubscription } from '@/hooks/useSubscription';

export default function TeamSettingsPage() {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get real team data and user from store
  const {
    team,
    user,
    updateTeam,
    teamUpdating,
    teamError,
    clearTeamError,
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

  // Get subscription info for feature gating
  const { features, showPaywall } = useSubscription();
  const canCustomizeBranding = features.canCustomizeBranding;

  // Check if user has admin access
  const canEdit = user?.isAdmin === 'true';

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-dismiss error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Show error from store
  useEffect(() => {
    if (teamError) {
      setErrorMessage(teamError);
      clearTeamError();
    }
  }, [teamError, clearTeamError]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveTeam = async (data: { name: string; sport: string }) => {
    if (!team?.id) return;
    try {
      await updateTeam(team.id, data);
      setShowEditModal(false);
      setSuccessMessage('Team settings updated successfully');
    } catch {
      // Error handled by store
    }
  };

  const handleDeleteTeam = async () => {
    if (!team?.id) return;
    setIsDeleting(true);
    try {
      await deleteTeam(team.id);
      await logout();
      router.push('/login');
    } catch {
      setErrorMessage('Failed to delete team');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSaveBranding = async (data: { primaryColor: string; secondaryColor: string }) => {
    if (!team?.id) return;
    try {
      await updateTeam(team.id, data);
      setSuccessMessage('Team branding updated successfully');
    } catch {
      // Error handled by store
    }
  };

  const handleLogoUpload = async (file: File, onProgress: (progress: number) => void) => {
    if (!team?.id) return;
    try {
      // Delete old logo if exists
      if (team.logoUrl) {
        try {
          await deleteTeamLogo(team.id, team.logoUrl);
        } catch {
          // Continue with upload even if delete fails
        }
      }
      const logoUrl = await uploadTeamLogo(team.id, file, onProgress);
      await updateTeam(team.id, { logoUrl });
      setSuccessMessage('Team logo uploaded successfully');
    } catch {
      setErrorMessage('Failed to upload logo');
    }
  };

  const handleLogoDelete = async () => {
    if (!team?.id || !team.logoUrl) return;
    try {
      await deleteTeamLogo(team.id, team.logoUrl);
      await updateTeam(team.id, { logoUrl: undefined });
      setSuccessMessage('Team logo removed');
    } catch {
      setErrorMessage('Failed to remove logo');
    }
  };

  const handleFontUpload = async (file: File, fontName: string, onProgress: (progress: number) => void) => {
    if (!team?.id) return;
    try {
      if (team.fontUrl) {
        try {
          await deleteTeamFont(team.id, team.fontUrl);
        } catch {
          // Continue with upload even if delete fails
        }
      }
      const fontUrl = await uploadTeamFont(team.id, file, fontName, onProgress);
      await updateTeam(team.id, { fontUrl, fontName });
      setSuccessMessage('Custom font uploaded successfully');
    } catch {
      setErrorMessage('Failed to upload font');
    }
  };

  const handleFontDelete = async () => {
    if (!team?.id || !team.fontUrl) return;
    try {
      await deleteTeamFont(team.id, team.fontUrl);
      await updateTeam(team.id, { fontUrl: undefined, fontName: undefined });
      setSuccessMessage('Custom font removed');
    } catch {
      setErrorMessage('Failed to remove font');
    }
  };

  // Show loading while team data is being fetched
  if (!team) {
    return <TeamPageSkeleton />;
  }

  return (
    <>
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <X className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900">Team Settings</h1>

        <TeamInfoCard
          name={team.name}
          sport={team.sport}
          teamId={team.id || 'unknown'}
          canEdit={canEdit}
          onEdit={handleEdit}
        />

        <TeamBrandingCard
          primaryColor={team.primaryColor}
          secondaryColor={team.secondaryColor}
          logoUrl={team.logoUrl}
          fontUrl={team.fontUrl}
          fontName={team.fontName}
          canEdit={canEdit}
          canCustomize={canCustomizeBranding}
          onSave={handleSaveBranding}
          onLogoUpload={handleLogoUpload}
          onLogoDelete={handleLogoDelete}
          onFontUpload={handleFontUpload}
          onFontDelete={handleFontDelete}
          onShowPaywall={() => showPaywall('canCustomizeBranding')}
          isSaving={teamUpdating}
        />

        {canEdit && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Danger Zone</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Delete Team</p>
                <p className="text-sm text-gray-500">Permanently delete this team and all its data</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {!canEdit && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              You need admin access to edit team settings. Contact your team administrator for changes.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <TeamEditModal
        open={showEditModal}
        name={team.name}
        sport={team.sport}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveTeam}
        isSaving={teamUpdating}
      />

      <TeamDeleteDialog
        open={showDeleteDialog}
        teamName={team.name}
        onConfirm={handleDeleteTeam}
        onCancel={() => setShowDeleteDialog(false)}
        isDeleting={isDeleting}
      />
    </>
  );
}

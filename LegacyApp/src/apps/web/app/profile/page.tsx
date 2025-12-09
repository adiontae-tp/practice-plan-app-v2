'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@ppa/store';
import { uploadProfilePhoto, deleteUserAccount } from '@ppa/firebase';
import { CheckCircle, X } from 'lucide-react';
import {
  ProfilePhotoCard,
  QuickInfoCard,
  PersonalInfoCard,
  AccountInfoCard,
  ProfilePageSkeleton,
  NotificationPreferencesCard,
  DeleteAccountCard,
} from '@/components/tp/profile';

export default function ProfilePage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const {
    // Real user data from Firebase
    user,
    updateUser,
    userUpdating,
    userError,
    clearUserError,
    // UI state
    profileIsEditing,
    profileFormFname,
    profileFormLname,
    setProfileIsEditing,
    setProfileFormFname,
    setProfileFormLname,
    // Navigation
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

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
    if (userError) {
      setErrorMessage(userError);
      clearUserError();
    }
  }, [userError, clearUserError]);

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  // Handlers
  const handleEdit = useCallback(() => {
    if (!user) return;
    setProfileFormFname(user.fname);
    setProfileFormLname(user.lname);
    setProfileIsEditing(true);
  }, [user, setProfileFormFname, setProfileFormLname, setProfileIsEditing]);

  const handleCancel = useCallback(() => {
    setProfileIsEditing(false);
    setProfileFormFname('');
    setProfileFormLname('');
  }, [setProfileIsEditing, setProfileFormFname, setProfileFormLname]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    try {
      await updateUser(user.uid, { fname: profileFormFname, lname: profileFormLname });
      setProfileIsEditing(false);
      setSuccessMessage('Profile updated successfully');
    } catch {
      // Error is handled by store and shown via userError
    }
  }, [user, profileFormFname, profileFormLname, updateUser, setProfileIsEditing]);

  const handleChangePhoto = useCallback(async (file: File) => {
    if (!user) return;
    setPhotoUploading(true);
    try {
      await uploadProfilePhoto(user.uid, file);
      setSuccessMessage('Photo updated successfully');
    } catch {
      setErrorMessage('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  }, [user]);

  // Show loading while user data is being fetched
  if (!user) {
    return <ProfilePageSkeleton />;
  }

  const fullName = `${user.fname} ${user.lname}`;

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

      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <ProfilePhotoCard
              name={fullName}
              email={user.email}
              photoUrl={user.photoUrl}
              onChangePhoto={handleChangePhoto}
              isUploading={photoUploading}
            />

            <QuickInfoCard
              role="Head Coach"
              permission={user.isAdmin === 'true' ? 'admin' : 'view'}
              status="active"
            />
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoCard
              fname={user.fname}
              lname={user.lname}
              isEditing={profileIsEditing}
              formFname={profileFormFname}
              formLname={profileFormLname}
              isSaving={userUpdating}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSave={handleSave}
              onFnameChange={setProfileFormFname}
              onLnameChange={setProfileFormLname}
            />

            <AccountInfoCard
              email={user.email}
              uid={user.uid}
              createdAt={user.created}
            />

            <NotificationPreferencesCard
              userId={user.uid}
              pushEnabled={user.pushEnabled}
              emailEnabled={user.emailEnabled}
              hasPushToken={!!user.fcmToken}
            />

            <DeleteAccountCard
              onDelete={async () => {
                setIsDeletingAccount(true);
                setErrorMessage(null);
                try {
                  const result = await deleteUserAccount();
                  if (result.success) {
                    // Redirect to login after successful deletion
                    router.push('/(auth)/login');
                  } else {
                    setErrorMessage(result.error || 'Failed to delete account. Please check the console for details.');
                    setIsDeletingAccount(false);
                  }
                } catch (error: any) {
                  console.error('[ProfilePage] Delete account error:', error);
                  const errorMsg = error?.message || error?.details || error?.toString() || 'Failed to delete account. Please check the console for details.';
                  setErrorMessage(errorMsg);
                  setIsDeletingAccount(false);
                }
              }}
              isDeleting={isDeletingAccount}
            />
          </div>
        </div>
      </div>
    </>
  );
}

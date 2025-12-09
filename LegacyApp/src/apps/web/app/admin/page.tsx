'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@ppa/store';
import type { UserWithTeam } from '@ppa/store';
import {
  isAdmin,
  fetchAllUsers,
  searchUsers,
  checkUserMigrationStatus,
  triggerMigrationForUser,
  sendPasswordResetToUser,
  sendEmail,
  fetchOldProjectUsers,
  searchOldProjectUsers,
  type OldProjectUser,
} from '@ppa/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReMigrationDialog } from '@/components/tp/ReMigrationDialog';
import { toast } from 'sonner';
import {
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  Users,
  Shield,
  AlertTriangle,
  Mail,
  Loader2,
  X,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const {
    user,
    adminAvailableUsers,
    adminUsersLoading,
    adminUsersError,
    adminUserSearch,
    adminIsImpersonating,
    adminImpersonatedUser,
    adminOriginalUser,
    setAdminAvailableUsers,
    setAdminUsersLoading,
    setAdminUsersError,
    setAdminUserSearch,
    startImpersonation,
    stopImpersonation,
    setAdminOriginalUser,
    setAdminMigrationLoading,
    adminMigrationLoading,
    // Impersonation data switching
    switchToImpersonatedUser,
    restoreOriginalUser,
    // Old project users state
    adminOldProjectUsers,
    adminOldProjectUsersLoading,
    adminOldProjectUsersError,
    adminOldProjectUsersHasMore,
    adminOldProjectUsersLastDoc,
    adminOldProjectUsersSearchQuery,
    adminSelectedTab,
    setAdminOldProjectUsers,
    appendAdminOldProjectUsers,
    setAdminOldProjectUsersLoading,
    setAdminOldProjectUsersError,
    setAdminOldProjectUsersHasMore,
    setAdminOldProjectUsersLastDoc,
    setAdminOldProjectUsersSearchQuery,
    setAdminSelectedTab,
    // Re-migration state
    adminReMigrationIsOpen,
    adminReMigrationUserId,
    adminReMigrationLoading,
    adminReMigrationProgress,
    openReMigrationDialog,
    closeReMigrationDialog,
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [selectedUserForMigration, setSelectedUserForMigration] = useState<string | null>(null);
  const [migrateAndSwitchDialogOpen, setMigrateAndSwitchDialogOpen] = useState(false);
  const [selectedOldUser, setSelectedOldUser] = useState<OldProjectUser | null>(null);
  const [switchingUser, setSwitchingUser] = useState<string | null>(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Check admin access
  const isAdminUser = isAdmin(user?.email);

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdminUser) {
      router.push('/dashboard');
      toast.error('Access denied. Admin only.');
    }
  }, [user, isAdminUser, router]);

  // Load users on mount
  useEffect(() => {
    if (isAdminUser) {
      loadUsers();
    }
  }, [isAdminUser]);

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  const loadUsers = useCallback(async () => {
    setAdminUsersLoading(true);
    setAdminUsersError(null);

    const result = adminUserSearch
      ? await searchUsers(adminUserSearch)
      : await fetchAllUsers();

    if (result.success) {
      setAdminAvailableUsers(result.users);
    } else {
      setAdminUsersError(result.error || 'Failed to load users');
    }

    setAdminUsersLoading(false);
  }, [adminUserSearch, setAdminAvailableUsers, setAdminUsersLoading, setAdminUsersError]);

  const loadOldProjectUsers = useCallback(async () => {
    setAdminOldProjectUsersLoading(true);
    setAdminOldProjectUsersError(null);

    const result = await fetchOldProjectUsers({ pageSize: 20 });

    if (result.success) {
      setAdminOldProjectUsers(result.users);
      setAdminOldProjectUsersHasMore(result.hasMore);
      setAdminOldProjectUsersLastDoc(result.lastDoc || null);
    } else {
      setAdminOldProjectUsersError(result.error || 'Failed to load old project users');
    }

    setAdminOldProjectUsersLoading(false);
  }, [
    setAdminOldProjectUsers,
    setAdminOldProjectUsersLoading,
    setAdminOldProjectUsersError,
    setAdminOldProjectUsersHasMore,
    setAdminOldProjectUsersLastDoc,
  ]);

  const loadMoreOldProjectUsers = useCallback(async () => {
    if (!adminOldProjectUsersHasMore || !adminOldProjectUsersLastDoc) return;

    setAdminOldProjectUsersLoading(true);
    setAdminOldProjectUsersError(null);

    const result = await fetchOldProjectUsers({
      pageSize: 20,
      lastDoc: adminOldProjectUsersLastDoc,
    });

    if (result.success) {
      appendAdminOldProjectUsers(result.users);
      setAdminOldProjectUsersHasMore(result.hasMore);
      setAdminOldProjectUsersLastDoc(result.lastDoc || null);
    } else {
      setAdminOldProjectUsersError(result.error || 'Failed to load more users');
    }

    setAdminOldProjectUsersLoading(false);
  }, [
    adminOldProjectUsersHasMore,
    adminOldProjectUsersLastDoc,
    appendAdminOldProjectUsers,
    setAdminOldProjectUsersLoading,
    setAdminOldProjectUsersError,
    setAdminOldProjectUsersHasMore,
    setAdminOldProjectUsersLastDoc,
  ]);

  const searchOldUsers = useCallback(async () => {
    if (!adminOldProjectUsersSearchQuery || adminOldProjectUsersSearchQuery.length < 3) {
      toast.error('Please enter at least 3 characters to search');
      return;
    }

    setAdminOldProjectUsersLoading(true);
    setAdminOldProjectUsersError(null);

    const result = await searchOldProjectUsers(adminOldProjectUsersSearchQuery);

    if (result.success) {
      setAdminOldProjectUsers(result.users);
      setAdminOldProjectUsersHasMore(false); // Search results don't support pagination
      setAdminOldProjectUsersLastDoc(null);
      if (result.users.length === 0) {
        toast.info('No users found matching your search');
      }
    } else {
      setAdminOldProjectUsersError(result.error || 'Failed to search users');
      toast.error(result.error || 'Failed to search users');
    }

    setAdminOldProjectUsersLoading(false);
  }, [
    adminOldProjectUsersSearchQuery,
    setAdminOldProjectUsers,
    setAdminOldProjectUsersLoading,
    setAdminOldProjectUsersError,
    setAdminOldProjectUsersHasMore,
    setAdminOldProjectUsersLastDoc,
  ]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isAdminUser) {
        loadUsers();
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [adminUserSearch, isAdminUser]);

  // Load old project users when tab switches to "old"
  useEffect(() => {
    if (isAdminUser && adminSelectedTab === 'old') {
      loadOldProjectUsers();
    }
  }, [adminSelectedTab, isAdminUser, loadOldProjectUsers]);

  const handleSwitchToUser = useCallback(async (targetUser: UserWithTeam) => {
    setSwitchingUser(targetUser.uid);
    try {
      // Store original user
      if (user && !adminOriginalUser) {
        setAdminOriginalUser(user);
      }

      // Update admin state
      startImpersonation(targetUser, user!);

      // Switch data subscriptions to impersonated user
      switchToImpersonatedUser(targetUser.uid);

      toast.success(`Now viewing as ${targetUser.fname} ${targetUser.lname}`);
    } catch (error) {
      toast.error('Failed to switch user');
    } finally {
      setSwitchingUser(null);
    }
  }, [user, adminOriginalUser, setAdminOriginalUser, startImpersonation, switchToImpersonatedUser]);

  const handleStopImpersonation = useCallback(() => {
    // Clear admin impersonation state
    stopImpersonation();

    // Restore original user's data subscriptions
    restoreOriginalUser();

    toast.success('Returned to your account');

    // Refresh the page after a short delay to ensure data is fully reloaded
    setTimeout(() => {
      router.push('/admin');
      router.refresh();
    }, 500);
  }, [stopImpersonation, restoreOriginalUser, router]);

  const handleCheckMigration = useCallback(async (email: string) => {
    setAdminMigrationLoading(true);
    try {
      const status = await checkUserMigrationStatus(email);

      if (status.needsMigration) {
        setSelectedUserForMigration(email);
        setMigrationDialogOpen(true);
      } else if (status.existsInNew) {
        toast.info('User already exists in the new project');
      } else if (!status.existsInOld) {
        toast.info('User not found in old project');
      }
    } catch (error) {
      toast.error('Failed to check migration status');
    } finally {
      setAdminMigrationLoading(false);
    }
  }, [setAdminMigrationLoading]);

  const handleTriggerMigration = useCallback(async () => {
    if (!selectedUserForMigration) return;

    setAdminMigrationLoading(true);
    try {
      const result = await triggerMigrationForUser(selectedUserForMigration);

      if (result.success) {
        toast.success(`User migrated successfully! They will receive a password reset email when they try to log in.`);
        await loadUsers();
      } else {
        toast.error(result.error || 'Migration failed');
      }
    } catch (error) {
      toast.error('Failed to trigger migration');
    } finally {
      setAdminMigrationLoading(false);
      setMigrationDialogOpen(false);
      setSelectedUserForMigration(null);
    }
  }, [selectedUserForMigration, loadUsers, setAdminMigrationLoading]);

  const handleSendPasswordReset = useCallback(async (email: string) => {
    const result = await sendPasswordResetToUser(email);
    if (result.success) {
      toast.success('Password reset email sent');
    } else {
      toast.error(result.error || 'Failed to send password reset');
    }
  }, []);

  const handleOldUserClick = useCallback((oldUser: OldProjectUser) => {
    if (oldUser.existsInNew) {
      // User already migrated, just switch to them
      // Find them in current users list
      const migratedUser = adminAvailableUsers.find(u => u.email === oldUser.email);
      if (migratedUser) {
        handleSwitchToUser(migratedUser);
      } else {
        toast.error('Migrated user not found. Try refreshing.');
      }
    } else {
      // Show migration dialog
      setSelectedOldUser(oldUser);
      setMigrateAndSwitchDialogOpen(true);
    }
  }, [adminAvailableUsers, handleSwitchToUser]);

  const handleMigrateAndSwitch = useCallback(async () => {
    if (!selectedOldUser) return;

    setAdminMigrationLoading(true);
    try {
      // Step 1: Trigger migration
      const migrationResult = await triggerMigrationForUser(selectedOldUser.email);

      if (!migrationResult.success) {
        toast.error(migrationResult.error || 'Migration failed');
        setAdminMigrationLoading(false);
        return;
      }

      toast.success(`User migrated successfully! They will receive a password reset email when they try to log in.`);

      // Step 2: Reload current users to get the newly created user
      await loadUsers();

      // Step 3: Re-fetch users directly to ensure we have the latest data
      const usersResult = await fetchAllUsers();
      const migratedUser = usersResult.success 
        ? usersResult.users.find(u => u.email === selectedOldUser.email)
        : null;
      
      if (migratedUser) {
        // Store original user
        if (user && !adminOriginalUser) {
          setAdminOriginalUser(user);
        }

        // Update admin state
        startImpersonation(migratedUser, user!);

        // Switch data subscriptions to impersonated user
        switchToImpersonatedUser(migratedUser.uid);

        toast.success(`Now viewing as ${migratedUser.fname} ${migratedUser.lname}`);
      } else {
        toast.warning('User migrated but not found. Try switching manually.');
      }
    } catch (error) {
      toast.error('Failed to migrate and switch');
      console.error('Migration error:', error);
    } finally {
      setAdminMigrationLoading(false);
      setMigrateAndSwitchDialogOpen(false);
      setSelectedOldUser(null);
    }
  }, [
    selectedOldUser,
    triggerMigrationForUser,
    loadUsers,
    adminAvailableUsers,
    user,
    adminOriginalUser,
    setAdminOriginalUser,
    startImpersonation,
    switchToImpersonatedUser,
    setAdminMigrationLoading,
  ]);

  const handleSendTestEmail = useCallback(async () => {
    setSendingTestEmail(true);
    try {
      const timestamp = new Date().toLocaleString();
      const emailId = await sendEmail({
        to: 'adiontae.gerron@gmail.com',
        subject: 'Test Email from Practice Plan App',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #356793; margin-bottom: 24px;">Test Email</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              This is a test email from the Practice Plan App email system.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              If you received this email, the email sending functionality is working correctly!
            </p>
            <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Sent at:</strong> ${timestamp}
              </p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
            <p style="font-size: 12px; color: #999;">
              This is a test email sent from the admin panel.
            </p>
          </div>
        `,
        text: `
Test Email

This is a test email from the Practice Plan App email system.

If you received this email, the email sending functionality is working correctly!

Sent at: ${timestamp}

---
This is a test email sent from the admin panel.
        `.trim(),
      });
      toast.success(`Test email queued! Email ID: ${emailId}`);
    } catch (error: any) {
      console.error('[AdminPage] Test email error:', error);
      toast.error(error?.message || 'Failed to send test email');
    } finally {
      setSendingTestEmail(false);
    }
  }, []);

  const getMigrationStatusBadge = (oldUser: OldProjectUser) => {
    if (oldUser.existsInNew) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
          Migrated - Password Reset Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
        Not Migrated
      </span>
    );
  };

  if (!isAdminUser) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Impersonation Banner */}
      {adminIsImpersonating && adminImpersonatedUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Viewing as another user</p>
              <p className="text-sm text-amber-700">
                {adminImpersonatedUser.fname} {adminImpersonatedUser.lname} ({adminImpersonatedUser.email})
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStopImpersonation}
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-500" />
            Admin Panel
          </h1>
          <p className="text-gray-500 mt-1">
            Manage users, trigger migrations, and view the app as other users.
          </p>
        </div>
        <Button onClick={loadUsers} variant="outline" disabled={adminUsersLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${adminUsersLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search & User List Card with Tabs */}
      <div className="bg-white border rounded-xl shadow-sm">
        <Tabs value={adminSelectedTab} onValueChange={(value) => setAdminSelectedTab(value as 'current' | 'old')}>
          {/* Tabs Header */}
          <div className="border-b p-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="current">
                Current Users ({adminAvailableUsers.length})
              </TabsTrigger>
              <TabsTrigger value="old">
                Old Project Users ({adminOldProjectUsers.length}{adminOldProjectUsersHasMore ? '+' : ''})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Current Users Tab Content */}
          <TabsContent value="current">
            <div className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={adminUserSearch}
                  onChange={(e) => setAdminUserSearch(e.target.value)}
                  className="pl-10"
                />
                {adminUserSearch && (
                  <button
                    onClick={() => setAdminUserSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Error */}
              {adminUsersError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{adminUsersError}</span>
                </div>
              )}

              {/* Current Users List */}
              <div className="border rounded-lg divide-y">
                {adminUsersLoading && adminAvailableUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Loading users...</p>
                  </div>
                ) : adminAvailableUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-8 w-8 mx-auto text-gray-300" />
                    <p className="text-gray-500 mt-2">No users found</p>
                  </div>
                ) : (
                  adminAvailableUsers.map((u) => {
                    const isCurrentUser = u.uid === user?.uid;
                    const isBeingSwitched = switchingUser === u.uid;

                    return (
                      <div key={u.uid} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                            {(u.fname?.[0] || 'U')}{(u.lname?.[0] || '')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {u.fname} {u.lname}
                              {isCurrentUser && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                  You
                                </span>
                              )}
                              {u.dataMigrated && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                  Active
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                            {u.teamName && (
                              <p className="text-xs text-gray-400">
                                {u.teamName}
                                {u.teamSport && ` • ${u.teamSport}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {!isCurrentUser && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSwitchToUser(u)}
                              disabled={isBeingSwitched}
                            >
                              {isBeingSwitched ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="ml-1">View As</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCheckMigration(u.email)}
                              disabled={adminMigrationLoading}
                              title="Check migration status"
                            >
                              <RefreshCw className={`h-4 w-4 ${adminMigrationLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendPasswordReset(u.email)}
                              title="Send password reset"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            {u.dataMigrated && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openReMigrationDialog(u.uid)}
                                title="Re-migrate user data"
                              >
                                <RefreshCw className="h-4 w-4" />
                                <span className="ml-1">Re-Migrate</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          {/* Old Project Users Tab Content */}
          <TabsContent value="old">
            <div className="p-4 space-y-4">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 text-blue-700">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Old Firebase Project Users</p>
                  <p className="text-blue-600 mt-1">
                    These users exist in the old Firebase project. Click "View As" to migrate and switch to them.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by email or name (min 3 characters)..."
                    value={adminOldProjectUsersSearchQuery}
                    onChange={(e) => setAdminOldProjectUsersSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        searchOldUsers();
                      }
                    }}
                    className="pl-10"
                  />
                  {adminOldProjectUsersSearchQuery && (
                    <button
                      onClick={() => {
                        setAdminOldProjectUsersSearchQuery('');
                        loadOldProjectUsers(); // Reload the default list
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={searchOldUsers}
                  disabled={adminOldProjectUsersLoading || adminOldProjectUsersSearchQuery.length < 3}
                  className="bg-[#356793] hover:bg-[#2a5276]"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Error */}
              {adminOldProjectUsersError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{adminOldProjectUsersError}</span>
                </div>
              )}

              {/* Old Users List */}
              <div className="space-y-4">
                <div className="border rounded-lg divide-y">
                  {adminOldProjectUsersLoading && adminOldProjectUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-500 mt-2">Loading old project users...</p>
                    </div>
                  ) : adminOldProjectUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-8 w-8 mx-auto text-gray-300" />
                      <p className="text-gray-500 mt-2">No users found in old project</p>
                    </div>
                  ) : (
                    adminOldProjectUsers.map((oldUser) => {
                      const isBeingSwitched = switchingUser === oldUser.email;

                      return (
                        <div key={oldUser.uid} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium">
                              {(oldUser.fname?.[0] || 'U')}{(oldUser.lname?.[0] || '')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">
                                  {oldUser.fname} {oldUser.lname}
                                </p>
                                {getMigrationStatusBadge(oldUser)}
                              </div>
                              <p className="text-sm text-gray-500">{oldUser.email}</p>
                              {oldUser.teamName && (
                                <p className="text-xs text-gray-400">
                                  {oldUser.teamName}
                                  {oldUser.teamSport && ` • ${oldUser.teamSport}`}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOldUserClick(oldUser)}
                              disabled={isBeingSwitched || adminMigrationLoading}
                            >
                              {isBeingSwitched ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="ml-1">
                                {oldUser.existsInNew ? 'View As' : 'Migrate & View'}
                              </span>
                            </Button>
                            {oldUser.existsInNew && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendPasswordReset(oldUser.email)}
                                title="Send password reset"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Load More Button */}
                {adminOldProjectUsersHasMore && adminOldProjectUsers.length > 0 && (
                  <div className="flex justify-center">
                    <Button
                      onClick={loadMoreOldProjectUsers}
                      variant="outline"
                      disabled={adminOldProjectUsersLoading}
                    >
                      {adminOldProjectUsersLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Load More
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Test Card */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Test
          </h2>
          <p className="text-sm text-gray-500 mt-1">Test the email sending functionality</p>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Send a test email to <strong>adiontae.gerron@gmail.com</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                The email will be queued in Firestore and sent via the Resend extension.
              </p>
            </div>
            <Button
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail}
              className="bg-[#356793] hover:bg-[#2a5276]"
            >
              {sendingTestEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Migration Dialog */}
      <Dialog open={migrationDialogOpen} onOpenChange={setMigrationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trigger Migration</DialogTitle>
            <DialogDescription>
              This user exists in the old Firebase project but not in the new one.
              Triggering migration will:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 my-4">
            <li>Create the user account in the new project</li>
            <li>Migrate all their data (team, plans, etc.)</li>
            <li>User will receive a password reset email when they try to log in</li>
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMigrationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTriggerMigration} disabled={adminMigrationLoading}>
              {adminMigrationLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Migrating...
                </>
              ) : (
                'Trigger Migration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Migrate and Switch Dialog */}
      <Dialog open={migrateAndSwitchDialogOpen} onOpenChange={setMigrateAndSwitchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Migrate User and Switch</DialogTitle>
            <DialogDescription>
              This will migrate <strong>{selectedOldUser?.email}</strong> from the old Firebase project to the new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-4">
            <p className="text-sm text-gray-700">The following will happen:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Create user account in new project with a temporary password</li>
              <li>Migrate all user data (team, plans, files, etc.)</li>
              <li>Switch your admin view to this user</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                When the user tries to log in for the first time, they'll receive a password reset email explaining the migration to the new platform. They can keep their old password or choose a new one.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMigrateAndSwitchDialogOpen(false);
                setSelectedOldUser(null);
              }}
              disabled={adminMigrationLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMigrateAndSwitch}
              disabled={adminMigrationLoading}
              className="bg-[#356793] hover:bg-[#2a5276]"
            >
              {adminMigrationLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Migrating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Migrate & Switch
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-Migration Dialog */}
      <ReMigrationDialog
        open={adminReMigrationIsOpen}
        onClose={closeReMigrationDialog}
        user={adminAvailableUsers.find((u) => u.uid === adminReMigrationUserId) || null}
      />
    </div>
  );
}

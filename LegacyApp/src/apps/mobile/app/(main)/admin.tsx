import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, Users, ArrowLeft, UserCheck, RefreshCw, AlertTriangle, Mail, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react-native';
import { COLORS, HEADER_STYLE } from '@ppa/ui/branding';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useAppStore } from '@ppa/store';
import type { UserWithTeam } from '@ppa/store';
import {
  fetchAllUsers,
  searchUsers,
  checkUserMigrationStatus,
  triggerMigrationForUser,
  sendPasswordResetToUser,
} from '@ppa/firebase';

interface UserCardProps {
  user: UserWithTeam;
  isCurrentUser: boolean;
  onSwitch: () => void;
  onCheckMigration: () => void;
  isLoading: boolean;
}

function UserCard({ user, isCurrentUser, onSwitch, onCheckMigration, isLoading }: UserCardProps) {
  const initials = `${(user.fname || 'U')[0]}${(user.lname || 'U')[0]}`.toUpperCase();

  return (
    <View className="bg-background-0 rounded-xl p-4 mb-3 border border-outline-100">
      <View className="flex-row items-center">
        {/* Avatar */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.primary[100] }}
        >
          <Text className="text-lg font-semibold" style={{ color: COLORS.primary[600] }}>
            {initials}
          </Text>
        </View>

        {/* User Info */}
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-typography-900">
            {user.fname} {user.lname}
            {isCurrentUser && (
              <Text className="text-sm text-primary-500"> (You)</Text>
            )}
          </Text>
          <Text className="text-sm text-typography-500">{user.email}</Text>
          {user.teamName && (
            <Text className="text-xs text-typography-400 mt-1">
              {user.teamName} • {user.teamSport || 'No sport'}
            </Text>
          )}
        </View>
      </View>

      {/* Actions */}
      {!isCurrentUser && (
        <View className="flex-row mt-3 pt-3 border-t border-outline-100">
          <TouchableOpacity
            onPress={onSwitch}
            disabled={isLoading}
            className="flex-1 flex-row items-center justify-center py-2 rounded-lg mr-2"
            style={{ backgroundColor: COLORS.primary[500] }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Eye size={16} color="#fff" />
                <Text className="text-white font-medium ml-2">View As</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCheckMigration}
            disabled={isLoading}
            className="flex-row items-center justify-center py-2 px-3 rounded-lg border border-outline-200"
          >
            <RefreshCw size={16} color={COLORS.gray[600]} />
            <Text className="text-typography-600 font-medium ml-2">Check</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function AdminScreen() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { user, isAdmin, isImpersonating, impersonatedUser, startImpersonation, stopImpersonation } = useData();

  // Store state
  const {
    adminAvailableUsers,
    adminUsersLoading,
    adminUsersError,
    adminUserSearch,
    adminMigrationLoading,
    adminMigrationError,
    setAdminAvailableUsers,
    setAdminUsersLoading,
    setAdminUsersError,
    setAdminUserSearch,
    setAdminMigrationLoading,
    setAdminMigrationError,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<{
    email: string;
    existsInOld: boolean;
    existsInNew: boolean;
    needsMigration: boolean;
  } | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have permission to access this page.');
      router.back();
    }
  }, [isAdmin, router]);

  // Fetch users on mount
  useEffect(() => {
    loadUsers();
  }, []);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  }, [loadUsers]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [adminUserSearch]);

  const handleSwitchToUser = useCallback(async (targetUser: UserWithTeam) => {
    setSelectedUserEmail(targetUser.email);
    try {
      await startImpersonation(targetUser);
      Alert.alert(
        'Viewing As User',
        `You are now viewing the app as ${targetUser.fname} ${targetUser.lname}. The data shown is their data.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to switch to user');
    } finally {
      setSelectedUserEmail(null);
    }
  }, [startImpersonation, router]);

  const handleStopImpersonation = useCallback(() => {
    stopImpersonation();
    Alert.alert('Switched Back', 'You are now viewing as yourself.');
  }, [stopImpersonation]);

  const handleCheckMigration = useCallback(async (email: string) => {
    setSelectedUserEmail(email);
    setAdminMigrationLoading(true);
    setAdminMigrationError(null);

    try {
      const status = await checkUserMigrationStatus(email);
      setMigrationStatus(status);

      if (status.needsMigration) {
        Alert.alert(
          'Migration Available',
          `This user exists in the old project but not in the new one. Would you like to trigger migration?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Migrate',
              onPress: () => handleTriggerMigration(email),
            },
          ]
        );
      } else if (status.existsInNew) {
        Alert.alert('Already Migrated', 'This user already exists in the new project.');
      } else if (!status.existsInOld) {
        Alert.alert('Not Found', 'This user does not exist in the old project.');
      }
    } catch (error) {
      setAdminMigrationError('Failed to check migration status');
      Alert.alert('Error', 'Failed to check migration status');
    } finally {
      setAdminMigrationLoading(false);
      setSelectedUserEmail(null);
    }
  }, [setAdminMigrationLoading, setAdminMigrationError]);

  const handleTriggerMigration = useCallback(async (email: string) => {
    setAdminMigrationLoading(true);

    try {
      const result = await triggerMigrationForUser(email);

      if (result.success) {
        Alert.alert(
          'Migration Complete',
          `User has been migrated. A password reset email has been sent to ${email}.`
        );
        // Refresh user list
        await loadUsers();
      } else {
        Alert.alert('Migration Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger migration');
    } finally {
      setAdminMigrationLoading(false);
    }
  }, [loadUsers, setAdminMigrationLoading]);

  const handleSendPasswordReset = useCallback(async (email: string) => {
    Alert.alert(
      'Send Password Reset',
      `Send a password reset email to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            const result = await sendPasswordResetToUser(email);
            if (result.success) {
              Alert.alert('Sent', 'Password reset email sent successfully.');
            } else {
              Alert.alert('Error', result.error || 'Failed to send password reset');
            }
          },
        },
      ]
    );
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Admin Panel',
          headerStyle: { backgroundColor: HEADER_STYLE.backgroundColor },
          headerTintColor: HEADER_STYLE.tintColor,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <ArrowLeft size={24} color={HEADER_STYLE.tintColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 bg-background-50">
        {/* Impersonation Banner */}
        {isImpersonating && impersonatedUser && (
          <View className="bg-warning-100 px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Eye size={18} color={COLORS.warning[700]} />
              <Text className="text-warning-700 font-medium ml-2" numberOfLines={1}>
                Viewing as: {impersonatedUser.fname} {impersonatedUser.lname}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleStopImpersonation}
              className="bg-warning-200 px-3 py-1 rounded-full"
            >
              <Text className="text-warning-700 font-medium">Exit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View className="px-4 py-3 bg-background-0 border-b border-outline-100">
          <View className="flex-row items-center bg-background-100 rounded-lg px-3 py-2">
            <Search size={20} color={COLORS.gray[400]} />
            <TextInput
              className="flex-1 ml-2 text-base text-typography-900"
              placeholder="Search users by email or name..."
              placeholderTextColor={COLORS.gray[400]}
              value={adminUserSearch}
              onChangeText={setAdminUserSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {adminUserSearch.length > 0 && (
              <TouchableOpacity onPress={() => setAdminUserSearch('')}>
                <XCircle size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* User Count */}
        <View className="px-4 py-2 flex-row items-center justify-between">
          <Text className="text-sm text-typography-500">
            {adminAvailableUsers.length} user{adminAvailableUsers.length !== 1 ? 's' : ''}
          </Text>
          {adminUsersLoading && (
            <ActivityIndicator size="small" color={COLORS.primary[500]} />
          )}
        </View>

        {/* Error State */}
        {adminUsersError && (
          <View className="mx-4 p-4 bg-error-100 rounded-lg flex-row items-center">
            <AlertTriangle size={20} color={COLORS.error[600]} />
            <Text className="text-error-600 ml-2 flex-1">{adminUsersError}</Text>
          </View>
        )}

        {/* User List */}
        <ScrollView
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        >
          {adminUsersLoading && adminAvailableUsers.length === 0 ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color={COLORS.primary[500]} />
              <Text className="text-typography-500 mt-4">Loading users...</Text>
            </View>
          ) : adminAvailableUsers.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Users size={48} color={COLORS.gray[300]} />
              <Text className="text-typography-500 mt-4">No users found</Text>
              {adminUserSearch && (
                <Text className="text-typography-400 text-sm mt-2">
                  Try a different search term
                </Text>
              )}
            </View>
          ) : (
            adminAvailableUsers.map((u) => (
              <UserCard
                key={u.uid}
                user={u}
                isCurrentUser={u.uid === user?.uid}
                onSwitch={() => handleSwitchToUser(u)}
                onCheckMigration={() => handleCheckMigration(u.email)}
                isLoading={selectedUserEmail === u.email}
              />
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Camera, Mail, User as UserIcon, LogOut, Users, Crown, Building2, Sparkles, Bug, Bell, Shield, ChevronRight, Trash2 } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPFooterButtons } from '@/components/tp';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useAppStore } from '@ppa/store';
import { TIER_NAMES, type SubscriptionTier } from '@ppa/subscription';
import { updateNotificationPreferences, registerForPushNotifications, requestNotificationPermissions, deleteUserAccount } from '@ppa/firebase';
import { TPAlert } from '@/components/tp';

// Developer emails that can access testing controls
const DEV_EMAILS = ['adiontae.gerron@gmail.com'];

interface ProfileFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function ProfileField({ label, value, icon }: ProfileFieldProps) {
  return (
    <View className="flex-row items-center py-4 border-b border-outline-100">
      <View className="w-10">{icon}</View>
      <View className="flex-1 ml-2">
        <Text className="text-xs text-typography-500 uppercase">{label}</Text>
        <Text className="text-base text-typography-900 mt-1">{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();
  const { user, team, isUserLoading } = useData();
  const [isEditMode, setIsEditMode] = useState(false);

  // Notification preferences state
  const [pushEnabled, setPushEnabled] = useState(user?.pushEnabled !== false);
  const [emailEnabled, setEmailEnabled] = useState(user?.emailEnabled !== false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isUpdatingNotif, setIsUpdatingNotif] = useState(false);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Subscription state for testing
  const { subscription, setSubscription } = useAppStore();

  // Check notification permissions on mount
  useEffect(() => {
    requestNotificationPermissions().then(setHasPermission);
  }, []);

  // Sync notification state with user data
  useEffect(() => {
    if (user) {
      setPushEnabled(user.pushEnabled !== false);
      setEmailEnabled(user.emailEnabled !== false);
    }
  }, [user?.pushEnabled, user?.emailEnabled]);

  // Use Firestore user data if available, fallback to auth user
  const firstName = user?.fname || authUser?.displayName?.split(' ')[0] || '';
  const lastName = user?.lname || authUser?.displayName?.split(' ')[1] || '';
  const email = user?.email || authUser?.email || '';
  const isAdmin = user?.isAdmin === 'true';
  const initials = `${(firstName || 'U')[0]}${(lastName || 'U')[0]}`.toUpperCase();

  // Check if current user is a developer
  const isDeveloper = DEV_EMAILS.includes(email.toLowerCase());

  // Handler to change subscription tier for testing
  const handleSetTier = useCallback((tier: SubscriptionTier) => {
    const entitlementMap = { free: 0, coach: 1, organization: 2 } as const;
    setSubscription({
      tier,
      entitlement: entitlementMap[tier],
      isActive: tier !== 'free',
      source: tier === 'free' ? 'none' : 'revenuecat',
      expiresAt: tier !== 'free' ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null, // 30 days
      willRenew: tier !== 'free',
      lastVerified: Date.now(),
    });
    Alert.alert('Subscription Updated', `Set to ${TIER_NAMES[tier]} tier for testing.`);
  }, [setSubscription]);

  // Notification preference handlers
  const handlePushToggle = useCallback(async (enabled: boolean) => {
    if (!user?.uid) return;

    if (enabled && !hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
        return;
      }
      setHasPermission(true);
      await registerForPushNotifications(user.uid);
    }

    setPushEnabled(enabled);
    setIsUpdatingNotif(true);
    try {
      await updateNotificationPreferences(user.uid, { pushEnabled: enabled });
    } catch (error) {
      setPushEnabled(!enabled);
      console.error('Failed to update push preference:', error);
    } finally {
      setIsUpdatingNotif(false);
    }
  }, [user?.uid, hasPermission]);

  const handleEmailToggle = useCallback(async (enabled: boolean) => {
    if (!user?.uid) return;

    setEmailEnabled(enabled);
    setIsUpdatingNotif(true);
    try {
      await updateNotificationPreferences(user.uid, { emailEnabled: enabled });
    } catch (error) {
      setEmailEnabled(!enabled);
      console.error('Failed to update email preference:', error);
    } finally {
      setIsUpdatingNotif(false);
    }
  }, [user?.uid]);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // Navigation will be handled by AuthContext
          },
        },
      ]
    );
  }, [signOut]);

  const handleEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleSave = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditMode(false);
  }, []);

  if (isUserLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Profile' }} />
        <View className="flex-1 bg-background-200 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView className="flex-1 bg-background-200">
        {/* Avatar Section */}
        <View className="items-center py-8 bg-white">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center">
              <Text className="text-white text-3xl font-bold">{initials}</Text>
            </View>
            {isEditMode && (
              <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-600 items-center justify-center border-2 border-white">
                <Camera size={14} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-xl font-bold text-typography-900 mt-4">
            {firstName} {lastName}
          </Text>
          {isAdmin && (
            <View className="bg-primary-100 rounded-full px-3 py-1 mt-2">
              <Text className="text-xs font-medium text-primary-700">Admin</Text>
            </View>
          )}
        </View>

        {/* Profile Fields */}
        <View className="p-4">
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-2 ml-1">
            Account Information
          </Text>
          <View className="bg-white rounded-xl px-4">
            <ProfileField
              label="First Name"
              value={firstName || '-'}
              icon={<UserIcon size={18} color={COLORS.textMuted} />}
            />
            <ProfileField
              label="Last Name"
              value={lastName || '-'}
              icon={<UserIcon size={18} color={COLORS.textMuted} />}
            />
            <ProfileField
              label="Email"
              value={email || '-'}
              icon={<Mail size={18} color={COLORS.textMuted} />}
            />
          </View>
        </View>

        {/* Team Info */}
        {team && (
          <View className="p-4 pt-0">
            <Text className="text-xs font-semibold text-typography-500 uppercase mb-2 ml-1">
              Team
            </Text>
            <View className="bg-white rounded-xl px-4">
              <ProfileField
                label="Team Name"
                value={team.name || '-'}
                icon={<Users size={18} color={COLORS.textMuted} />}
              />
              <ProfileField
                label="Sport"
                value={team.sport || '-'}
                icon={<Users size={18} color={COLORS.textMuted} />}
              />
            </View>
          </View>
        )}

        {/* Notification Preferences */}
        <View className="p-4 pt-0">
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-2 ml-1">
            Notifications
          </Text>
          <View className="bg-white rounded-xl px-4">
            <View className="flex-row items-center justify-between py-4 border-b border-outline-100">
              <View className="flex-row items-center flex-1">
                <View className="w-10">
                  <Bell size={18} color={COLORS.textMuted} />
                </View>
                <View className="ml-2 flex-1">
                  <Text className="text-base text-typography-900">Push Notifications</Text>
                  <Text className="text-xs text-typography-500">
                    {hasPermission ? 'Receive instant alerts' : 'Enable to receive alerts'}
                  </Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={handlePushToggle}
                disabled={isUpdatingNotif}
                trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                thumbColor="white"
              />
            </View>
            <View className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center flex-1">
                <View className="w-10">
                  <Mail size={18} color={COLORS.textMuted} />
                </View>
                <View className="ml-2 flex-1">
                  <Text className="text-base text-typography-900">Email Notifications</Text>
                  <Text className="text-xs text-typography-500">Receive updates via email</Text>
                </View>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={handleEmailToggle}
                disabled={isUpdatingNotif}
                trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Developer Testing Controls - Only visible to dev emails */}
        {isDeveloper && (
          <View className="p-4 pt-0">
            <View className="flex-row items-center mb-2 ml-1">
              <Bug size={14} color={COLORS.textMuted} />
              <Text className="text-xs font-semibold text-typography-500 uppercase ml-1">
                Developer Testing
              </Text>
            </View>
            <View className="bg-white rounded-xl p-4">
              {/* Current Tier Display */}
              <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-outline-100">
                <Text className="text-sm text-typography-600">Current Tier</Text>
                <View className="flex-row items-center bg-primary-100 px-3 py-1 rounded-full">
                  <Crown size={14} color={COLORS.primary} />
                  <Text className="text-sm font-semibold text-primary-700 ml-1">
                    {TIER_NAMES[subscription.tier]}
                  </Text>
                </View>
              </View>

              {/* Tier Selection Buttons */}
              <Text className="text-xs text-typography-500 mb-3">
                Tap to simulate subscription tier:
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-xl items-center ${
                    subscription.tier === 'free' ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                  onPress={() => handleSetTier('free')}
                >
                  <Sparkles size={20} color={subscription.tier === 'free' ? COLORS.primary : COLORS.textMuted} />
                  <Text className={`text-xs font-medium mt-1 ${
                    subscription.tier === 'free' ? 'text-primary-700' : 'text-typography-600'
                  }`}>
                    Free
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 p-3 rounded-xl items-center ${
                    subscription.tier === 'coach' ? 'bg-primary-100' : 'bg-gray-100'
                  }`}
                  onPress={() => handleSetTier('coach')}
                >
                  <Crown size={20} color={subscription.tier === 'coach' ? COLORS.primary : COLORS.textMuted} />
                  <Text className={`text-xs font-medium mt-1 ${
                    subscription.tier === 'coach' ? 'text-primary-700' : 'text-typography-600'
                  }`}>
                    Coach
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 p-3 rounded-xl items-center ${
                    subscription.tier === 'organization' ? 'bg-secondary-100' : 'bg-gray-100'
                  }`}
                  onPress={() => handleSetTier('organization')}
                >
                  <Building2 size={20} color={subscription.tier === 'organization' ? COLORS.secondary : COLORS.textMuted} />
                  <Text className={`text-xs font-medium mt-1 ${
                    subscription.tier === 'organization' ? 'text-secondary-700' : 'text-typography-600'
                  }`}>
                    Org
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-xs text-typography-400 mt-3 text-center">
                This only affects local state for testing UI gates.
              </Text>

              {/* Admin Panel Link */}
              <TouchableOpacity
                className="flex-row items-center justify-between mt-4 pt-4 border-t border-outline-100"
                onPress={() => router.push('/(main)/admin')}
              >
                <View className="flex-row items-center">
                  <Shield size={18} color={COLORS.primary} />
                  <Text className="text-base font-medium text-primary-600 ml-2">
                    Admin Panel
                  </Text>
                </View>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Delete Account */}
        <View className="p-4 pt-0">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 flex-row items-center justify-center border border-red-200"
            onPress={() => setShowDeleteConfirm(true)}
            disabled={isDeletingAccount}
          >
            <Trash2 size={18} color={COLORS.error} />
            <Text className="text-base font-medium text-error-500 ml-2">
              Delete Account
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-500 text-center mt-2 px-4">
            Permanently delete your account and all data
          </Text>
        </View>

        {/* Sign Out */}
        <View className="p-4 pt-0">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 flex-row items-center justify-center"
            onPress={handleSignOut}
          >
            <LogOut size={18} color={COLORS.error} />
            <Text className="text-base font-medium text-error-500 ml-2">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <TPFooterButtons
        mode={isEditMode ? 'edit' : 'view'}
        onCancel={isEditMode ? handleCancel : () => router.back()}
        onEdit={handleEdit}
        onSave={handleSave}
        cancelLabel={isEditMode ? 'Cancel' : 'Close'}
        editLabel="Edit"
        saveLabel="Save"
        canEdit={true}
      />

      {/* Delete Account Confirmation */}
      <TPAlert
        isOpen={showDeleteConfirm}
        onClose={() => !isDeletingAccount && setShowDeleteConfirm(false)}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account?"
        description="This action cannot be undone. This will permanently delete your account, team data, practice plans, and all associated information."
        cancelLabel="Cancel"
        confirmLabel={isDeletingAccount ? 'Deleting...' : 'Yes, delete my account'}
        onConfirm={async () => {
          setIsDeletingAccount(true);
          try {
            const result = await deleteUserAccount();
            if (result.success) {
              // User will be signed out automatically
              router.replace('/(auth)/login');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete account');
              setIsDeletingAccount(false);
              setShowDeleteConfirm(false);
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete account');
            setIsDeletingAccount(false);
            setShowDeleteConfirm(false);
          }
        }}
        isLoading={isDeletingAccount}
        type="destructive"
      />
    </>
  );
}

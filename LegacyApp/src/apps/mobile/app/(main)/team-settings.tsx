import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Users, Trophy, ChevronRight, Trash2, Upload, Check, X } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPFooterButtons } from '@/components/tp';
import { useAppStore } from '@ppa/store';
import { uploadTeamLogo, deleteTeamLogo } from '@ppa/firebase';
import { useSubscription } from '@/hooks/useSubscription';

// Available colors - expanded palette
const AVAILABLE_COLORS = [
  { name: 'Blue', value: '#356793' },
  { name: 'Navy', value: '#0f172a' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Indigo', value: '#4f46e5' },
];

interface SettingItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

function SettingItem({ label, value, icon, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-4 border-b border-outline-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-10">{icon}</View>
      <View className="flex-1 ml-2">
        <Text className="text-xs text-typography-500 uppercase">{label}</Text>
        <Text className="text-base text-typography-900 mt-1">{value}</Text>
      </View>
      <ChevronRight size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function TeamSettingsScreen() {
  const router = useRouter();
  const { team, updateTeam, teamUpdating } = useAppStore();
  const { features, showPaywall } = useSubscription();
  const canCustomizeBranding = features.canCustomizeBranding;

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPrimaryColor, setSelectedPrimaryColor] = useState('#356793');
  const [selectedSecondaryColor, setSelectedSecondaryColor] = useState('#ec4899');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize colors from team data
  useEffect(() => {
    if (team) {
      setSelectedPrimaryColor(team.primaryColor || '#356793');
      setSelectedSecondaryColor(team.secondaryColor || '#ec4899');
    }
  }, [team]);

  const handleLogoUpload = useCallback(async () => {
    if (!team?.id) return;
    if (!canCustomizeBranding) {
      showPaywall('canCustomizeBranding');
      return;
    }

    // expo-image-picker requires a development build - show placeholder message
    Alert.alert(
      'Feature Coming Soon',
      'Logo upload requires a development build. This feature will be available when the app is published to the App Store.',
      [{ text: 'OK' }]
    );
  }, [team?.id, canCustomizeBranding, showPaywall]);

  const handleLogoDelete = useCallback(async () => {
    if (!team?.id || !team.logoUrl) return;

    Alert.alert(
      'Delete Logo',
      'Are you sure you want to remove the team logo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteTeamLogo(team.id!, team.logoUrl!);
              await updateTeam(team.id!, { logoUrl: undefined });
              Alert.alert('Success', 'Team logo removed.');
            } catch (error) {
              console.error('Failed to delete logo:', error);
              Alert.alert('Error', 'Failed to remove logo. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [team?.id, team?.logoUrl, updateTeam]);

  const handleEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!team?.id) return;

    try {
      await updateTeam(team.id, {
        primaryColor: selectedPrimaryColor,
        secondaryColor: selectedSecondaryColor,
      });
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to update team:', error);
    }
  }, [team?.id, selectedPrimaryColor, selectedSecondaryColor, updateTeam]);

  const handleCancel = useCallback(() => {
    setIsEditMode(false);
    // Reset to saved values
    if (team) {
      setSelectedPrimaryColor(team.primaryColor || '#356793');
      setSelectedSecondaryColor(team.secondaryColor || '#ec4899');
    }
  }, [team]);

  // Show loading if no team data
  if (!team) {
    return (
      <>
        <Stack.Screen options={{ title: 'Team Settings' }} />
        <View className="flex-1 bg-background-200 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-sm text-typography-500 mt-4">Loading team...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Team Settings' }} />
      <ScrollView className="flex-1 bg-background-200" scrollEnabled={!isEditMode}>
        {/* Team Info Section */}
        <View className="p-4">
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-2 ml-1">
            Team Information
          </Text>
          <View className="bg-white rounded-xl px-4">
            <SettingItem
              label="Team Name"
              value={team.name}
              icon={<Users size={18} color={COLORS.textMuted} />}
            />
            <SettingItem
              label="Sport"
              value={team.sport}
              icon={<Trophy size={18} color={COLORS.textMuted} />}
            />
          </View>
        </View>

        {/* Team Branding Section */}
        <View className="p-4 pt-0">
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-2 ml-1">
            Team Branding
          </Text>
          <View className="bg-white rounded-xl overflow-hidden">
            {/* Logo Section */}
            <View className="border-b border-outline-100 p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-medium text-typography-900">Team Logo</Text>
                {isEditMode && (
                  <View className="flex-row items-center gap-2">
                    {team.logoUrl && (
                      <TouchableOpacity 
                        onPress={handleLogoDelete}
                        disabled={isDeleting}
                        className="flex-row items-center gap-1 py-2 px-3 rounded-lg bg-error-50"
                      >
                        {isDeleting ? (
                          <ActivityIndicator size="small" color={COLORS.error} />
                        ) : (
                          <>
                            <X size={14} color={COLORS.error} />
                            <Text className="text-xs font-medium text-error-600">Remove</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      onPress={handleLogoUpload}
                      disabled={isUploading}
                      className="flex-row items-center gap-1 py-2 px-3 rounded-lg bg-gray-100"
                    >
                      {isUploading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      ) : (
                        <>
                          <Upload size={14} color={COLORS.primary} />
                          <Text className="text-xs font-medium text-primary-500">
                            {team.logoUrl ? 'Change' : 'Upload'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View className="flex-row items-center gap-4">
                {team.logoUrl ? (
                  <Image
                    source={{ uri: team.logoUrl }}
                    className="w-20 h-20 rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-lg bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300">
                    <View 
                      className="w-10 h-10 rounded-lg items-center justify-center"
                      style={{ backgroundColor: selectedPrimaryColor }}
                    >
                      <Text className="text-white font-bold text-sm">
                        {team.name?.substring(0, 2).toUpperCase() || 'TP'}
                      </Text>
                    </View>
                  </View>
                )}
                {isUploading && uploadProgress > 0 && (
                  <View className="flex-1">
                    <Text className="text-xs text-typography-500 mb-1">
                      Uploading... {Math.round(uploadProgress)}%
                    </Text>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </View>
                  </View>
                )}
              </View>
              {!canCustomizeBranding && (
                <TouchableOpacity 
                  onPress={() => showPaywall('canCustomizeBranding')}
                  className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <Text className="text-xs text-amber-800">
                    Upgrade to Organization tier to customize team branding
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Primary Color Section */}
            <View className="border-b border-outline-100 p-4">
              <Text className="text-sm font-medium text-typography-900 mb-3">Primary Color</Text>
              <View className="flex-row flex-wrap gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    onPress={() => isEditMode && setSelectedPrimaryColor(color.value)}
                    disabled={!isEditMode}
                    className={`items-center justify-center gap-1 ${isEditMode ? 'opacity-100' : 'opacity-70'}`}
                  >
                    <View
                      className={`w-12 h-12 rounded-lg items-center justify-center border-2 ${
                        selectedPrimaryColor === color.value ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {selectedPrimaryColor === color.value && (
                        <Check size={20} color="white" strokeWidth={3} />
                      )}
                    </View>
                    <Text className="text-xs font-medium text-gray-700 text-center">{color.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Secondary Color Section */}
            <View className="p-4">
              <Text className="text-sm font-medium text-typography-900 mb-3">Secondary Color</Text>
              <View className="flex-row flex-wrap gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    onPress={() => isEditMode && setSelectedSecondaryColor(color.value)}
                    disabled={!isEditMode}
                    className={`items-center justify-center gap-1 ${isEditMode ? 'opacity-100' : 'opacity-70'}`}
                  >
                    <View
                      className={`w-12 h-12 rounded-lg items-center justify-center border-2 ${
                        selectedSecondaryColor === color.value ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {selectedSecondaryColor === color.value && (
                        <Check size={20} color="white" strokeWidth={3} />
                      )}
                    </View>
                    <Text className="text-xs font-medium text-gray-700 text-center">{color.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="p-4 pt-0 pb-24">
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-2 ml-1">
            Danger Zone
          </Text>
          <View className="bg-white rounded-xl overflow-hidden">
            <TouchableOpacity className="p-4 flex-row items-center" disabled={isEditMode}>
              <View className="w-10 h-10 rounded-full bg-error-100 items-center justify-center">
                <Trash2 size={18} color={COLORS.error} />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-base font-medium text-error-600">
                  Delete Team
                </Text>
                <Text className="text-sm text-typography-500 mt-0.5">
                  This action cannot be undone
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
        loading={teamUpdating}
      />
    </>
  );
}

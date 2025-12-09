import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable, ScrollView, Modal } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Menu, LogOut, ChevronRight } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

interface TabHeaderWithMenuProps {
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

/**
 * Custom header component for tab navigation
 * Shows page title in center and menu button in top-right
 * Opens a drawer with user profile, team switching, and account options
 */
// Map routes to display titles
const getPageTitle = (pathname: string): string => {
  if (pathname.includes('practice-templates')) return 'Practice Templates';
  if (pathname.includes('period-templates')) return 'Period Templates';
  if (pathname.includes('tags')) return 'Tags';
  if (pathname.includes('coaches')) return 'Coaches';
  if (pathname.includes('announcements')) return 'Announcements';
  if (pathname.includes('files')) return 'Files';
  if (pathname.includes('menu')) return 'Menu';
  if (pathname.includes('calendar')) return 'Calendar';
  if (pathname.includes('index') || pathname === '/(tabs)' || pathname === '/') return 'Practice';
  return 'App';
};

// Create a wrapper component for proper header rendering
let globalMenuState = { open: false, setOpen: (val: boolean) => {} };
let globalTeamModalState = { open: false, setOpen: (val: boolean) => {} };

export const TabHeaderWithMenu = ({ onMenuOpen, onMenuClose }: TabHeaderWithMenuProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, team } = useData();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const pageTitle = getPageTitle(pathname);

  // Store state globally for modal access
  useEffect(() => {
    globalMenuState.open = menuOpen;
    globalMenuState.setOpen = setMenuOpen;
    globalTeamModalState.open = showTeamModal;
    globalTeamModalState.setOpen = setShowTeamModal;
  }, [menuOpen, showTeamModal]);

  // Generate initials from user name, fallback to "?"
  const initials = user?.fname && user?.lname
    ? `${user.fname[0]}${user.lname[0]}`
    : '?';

  // Check if user is admin (isAdmin is stored as string in Firestore)
  const isAdmin = user?.isAdmin === 'true' || user?.isAdmin === true;

  const handleMenuPress = useCallback(() => {
    setMenuOpen(true);
    onMenuOpen?.();
  }, [onMenuOpen]);

  const handleCloseMenu = useCallback(() => {
    setMenuOpen(false);
    onMenuClose?.();
  }, [onMenuClose]);

  const handleProfilePress = useCallback(() => {
    handleCloseMenu();
    router.push('/(main)/profile' as never);
  }, [router, handleCloseMenu]);

  const handleSwitchTeam = useCallback(() => {
    setShowTeamModal(true);
  }, []);

  const handleTeamSelect = useCallback((teamId: string) => {
    setShowTeamModal(false);
    handleCloseMenu();
    console.log('Switched to team:', teamId);
  }, [handleCloseMenu]);

  const handleTeamSettings = useCallback(() => {
    handleCloseMenu();
    router.push('/(main)/team-settings' as never);
  }, [router, handleCloseMenu]);

  const handleSubscription = useCallback(() => {
    handleCloseMenu();
    router.push('/(main)/subscription' as never);
  }, [router, handleCloseMenu]);

  const handleContact = useCallback(() => {
    handleCloseMenu();
    router.push('/(main)/contact' as never);
  }, [router, handleCloseMenu]);

  const handleSignOut = useCallback(async () => {
    handleCloseMenu();
    await signOut();
  }, [handleCloseMenu, signOut]);

  return (
    <>
      <View className="flex-row items-center justify-between h-14 px-4" style={{ backgroundColor: COLORS.primary }}>
        {/* Spacer for left side */}
        <View className="w-10" />

        {/* Center - Page Title */}
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-white">
            {pageTitle}
          </Text>
        </View>

        {/* Right - Menu Button */}
        <TouchableOpacity
          onPress={handleMenuPress}
          className="w-10 h-10 items-center justify-center"
        >
          <Menu size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Menu Drawer Modal */}
      <Modal
        transparent
        visible={menuOpen}
        onRequestClose={handleCloseMenu}
        animationType="fade"
      >
        {/* Backdrop */}
        <Pressable
          className="absolute inset-0 bg-black/40"
          onPress={handleCloseMenu}
        />

        {/* Drawer from right */}
        <View className="flex-1 flex-row justify-end">
          <View className="w-96 bg-[#e0e0e0] flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              {/* User Profile Card */}
              <Pressable
                onPress={handleProfilePress}
                className="bg-white mx-5 mt-6 rounded-xl p-5 flex-row items-center active:bg-gray-50"
              >
                <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center">
                  <Text className="text-white font-semibold text-xl">{initials}</Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-lg font-semibold text-gray-900">
                    {user?.fname || ''} {user?.lname || ''}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1.5">{team?.name || 'No Team'}</Text>
                </View>
                <ChevronRight size={22} color="#9CA3AF" />
              </Pressable>

              {/* Divider */}
              <View className="h-6" />

              {/* Team Management Section */}
              <View className="mx-5 mb-6">
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">
                  Team
                </Text>
                <Pressable
                  onPress={handleSwitchTeam}
                  className="bg-white rounded-xl p-5 flex-row items-center justify-between active:bg-gray-50"
                >
                  <Text className="text-base font-medium text-gray-900">Switch Team</Text>
                  <ChevronRight size={22} color="#9CA3AF" />
                </Pressable>
              </View>

              {/* Settings Section */}
              <View className="mx-5 mb-6">
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">
                  Settings
                </Text>
                <View className="bg-white rounded-xl overflow-hidden">
                  {isAdmin && (
                    <Pressable
                      onPress={handleTeamSettings}
                      className="p-5 flex-row items-center justify-between border-b border-gray-100 active:bg-gray-50"
                    >
                      <Text className="text-base font-medium text-gray-900">Team Settings</Text>
                      <ChevronRight size={22} color="#9CA3AF" />
                    </Pressable>
                  )}
                  <Pressable
                    onPress={handleSubscription}
                    className={`p-5 flex-row items-center justify-between ${
                      isAdmin ? 'border-b border-gray-100' : ''
                    } active:bg-gray-50`}
                  >
                    <Text className="text-base font-medium text-gray-900">Subscription</Text>
                    <ChevronRight size={22} color="#9CA3AF" />
                  </Pressable>
                  <Pressable
                    onPress={handleContact}
                    className="p-5 flex-row items-center justify-between active:bg-gray-50"
                  >
                    <Text className="text-base font-medium text-gray-900">Contact Developer</Text>
                    <ChevronRight size={22} color="#9CA3AF" />
                  </Pressable>
                </View>
              </View>

              {/* Sign Out */}
              <View className="mx-5 mb-6">
                <Pressable
                  onPress={handleSignOut}
                  className="bg-white rounded-xl p-5 flex-row items-center justify-center active:bg-gray-50"
                >
                  <LogOut size={20} color={COLORS.error} />
                  <Text className="text-base font-medium text-error-500 ml-2.5">Sign Out</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Team Switch Modal */}
      <Modal
        transparent
        visible={showTeamModal}
        onRequestClose={() => setShowTeamModal(false)}
        animationType="slide"
      >
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={() => setShowTeamModal(false)}
        />
        <View className="flex-1 items-end justify-end">
          <Pressable
            className="bg-white w-full rounded-t-3xl p-5"
            onPress={() => {}}
          >
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-4">Select Team</Text>
            <View className="gap-3">
              {/* Current team - selected by default */}
              {team && (
                <Pressable
                  onPress={() => handleTeamSelect(team.id || '')}
                  className="p-4 rounded-xl border-2 flex-row items-center bg-primary-50 border-primary-500"
                >
                  <View className="w-5 h-5 rounded-full border-2 items-center justify-center border-primary-500">
                    <View className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  </View>
                  <Text className="text-base font-medium ml-3 text-primary-500">
                    {team.name}
                  </Text>
                </Pressable>
              )}
              {!team && (
                <Text className="text-gray-500 text-center py-4">No teams available</Text>
              )}
            </View>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

import React, { useState } from 'react';
import { TouchableOpacity, Pressable, View, Text } from 'react-native';
import { 
  Menu, 
  LogOut, 
  ChevronRight, 
  X, 
  Users, 
  Settings, 
  CreditCard, 
  Mail,
  User
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@ppa/ui/branding';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerBody,
  DrawerFooter,
} from '@/components/ui/drawer';
import { TPBottomSheet } from '@/components/tp';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamTheme } from '@/contexts/TeamThemeContext';

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  color?: string;
  iconColor?: string;
  showChevron?: boolean;
}

const MenuItem = ({ 
  icon: Icon, 
  label, 
  onPress, 
  color = "text-gray-900", 
  iconColor = "#6B7280", // gray-500
  showChevron = true 
}: MenuItemProps) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center justify-between py-4 px-6 active:bg-gray-50"
  >
    <View className="flex-row items-center">
      <Icon size={22} color={iconColor} />
      <Text className={`ml-4 text-base font-medium ${color}`}>
        {label}
      </Text>
    </View>
    {showChevron && <ChevronRight size={20} color="#D1D5DB" />}
  </Pressable>
);

export const HeaderRight = () => {
  const router = useRouter();
  const { user, team } = useData();
  const { signOut } = useAuth();
  const { colors } = useTeamTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Generate initials from user name, fallback to "?"
  const initials = user?.fname && user?.lname
    ? `${user.fname[0]}${user.lname[0]}`
    : '?';

  // Check if user is admin
  const isAdmin = user?.isAdmin === 'true' || user?.isAdmin === true;

  const handleMenuPress = () => {
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
    if (showTeamModal) {
      setShowTeamModal(false);
    }
  };

  const handleSwitchTeam = () => {
    setShowTeamModal(true);
  };

  const handleTeamSelect = (teamId: string) => {
    setShowTeamModal(false);
    handleCloseMenu();
    console.log('Switched to team:', teamId);
  };

  const handleProfilePress = () => {
    handleCloseMenu();
    router.push('/(main)/profile' as never);
  };

  const handleTeamSettings = () => {
    handleCloseMenu();
    router.push('/(main)/team-settings' as never);
  };

  const handleSubscription = () => {
    handleCloseMenu();
    router.push('/(main)/subscription' as never);
  };

  const handleContactDeveloper = () => {
    handleCloseMenu();
    router.push('/(main)/contact' as never);
  };

  const handleSignOut = async () => {
    handleCloseMenu();
    await signOut();
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleMenuPress}
        className="w-10 h-10 items-center justify-center mr-2"
      >
        <Menu size={24} color="white" />
      </TouchableOpacity>

      {/* Menu Drawer */}
      <Drawer isOpen={menuOpen} onClose={handleCloseMenu} anchor="right" size="lg">
        <DrawerBackdrop />
        <DrawerContent className="p-0 bg-white w-[80%]">
          {/* Profile Header */}
          <View style={{ backgroundColor: colors.primary }} className="pt-14 pb-8 px-6">
            <View className="flex-row justify-between items-start mb-4">
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center border-2 border-white/30">
                <Text className="text-white text-2xl font-bold">{initials}</Text>
              </View>
              <TouchableOpacity 
                onPress={handleCloseMenu} 
                className="p-2 bg-white/10 rounded-full active:bg-white/20"
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Pressable onPress={handleProfilePress}>
              <Text className="text-white text-xl font-bold">
                {user?.fname || ''} {user?.lname || ''}
              </Text>
              <Text className="text-primary-100 text-sm mt-1 font-medium">
                {team?.name || 'No Team Selected'}
              </Text>
            </Pressable>
          </View>

          <DrawerBody className="mt-0 mb-0 p-0">
            <View className="py-2">
              <Text className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Account
              </Text>
              <MenuItem 
                icon={User} 
                label="Profile" 
                onPress={handleProfilePress} 
              />
              <MenuItem 
                icon={Users} 
                label="Switch Team" 
                onPress={handleSwitchTeam} 
              />
              
              <View className="h-4" />
              
              <Text className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Preferences
              </Text>
              
              {isAdmin && (
                <MenuItem 
                  icon={Settings} 
                  label="Team Settings" 
                  onPress={handleTeamSettings} 
                />
              )}
              <MenuItem 
                icon={CreditCard} 
                label="Subscription" 
                onPress={handleSubscription} 
              />
              <MenuItem 
                icon={Mail} 
                label="Contact Support" 
                onPress={handleContactDeveloper} 
              />
            </View>
          </DrawerBody>

          <DrawerFooter className="p-0 border-t border-gray-100">
            <Pressable
              onPress={handleSignOut}
              className="w-full flex-row items-center py-5 px-6 active:bg-red-50"
            >
              <LogOut size={22} color={COLORS.error} />
              <Text className="ml-4 text-base font-medium text-error-500">
                Sign Out
              </Text>
            </Pressable>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Team Switch Bottom Sheet */}
      <TPBottomSheet
        isOpen={showTeamModal}
        onOpenChange={setShowTeamModal}
        detents={['medium']}
      >
        <View className="p-5">
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
        </View>
      </TPBottomSheet>
    </>
  );
};
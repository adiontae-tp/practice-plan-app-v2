import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, HardDrive } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import { useSubscription } from '@/hooks/useSubscription';
import { formatStorageSize, getStoragePercentUsed } from '@ppa/subscription/src/featureGates';
import { useRouter } from 'expo-router';

interface StorageUsageBannerProps {
  onUpgrade?: () => void;
}

export function StorageUsageBanner({ onUpgrade }: StorageUsageBannerProps) {
  const router = useRouter();
  const storageUsedBytes = useAppStore((state) => state.storageUsedBytes);
  const storageLimitBytes = useAppStore((state) => state.storageLimitBytes);
  const { tier } = useSubscription();

  const percentUsed = getStoragePercentUsed(tier, storageUsedBytes);
  const isNearLimit = percentUsed >= 80;
  const isOverLimit = percentUsed >= 100;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/subscription' as never);
    }
  };

  if (storageLimitBytes === 0) return null;

  const progressColor = isOverLimit
    ? COLORS.error
    : isNearLimit
    ? '#f59e0b'
    : COLORS.primary;

  return (
    <View className="mx-5 mb-4">
      <View className={`rounded-xl p-4 ${isOverLimit ? 'bg-red-50' : isNearLimit ? 'bg-amber-50' : 'bg-gray-50'}`}>
        <View className="flex-row items-center mb-3">
          {isOverLimit || isNearLimit ? (
            <AlertTriangle size={20} color={isOverLimit ? COLORS.error : '#f59e0b'} />
          ) : (
            <HardDrive size={20} color={COLORS.textMuted} />
          )}
          <Text className={`text-sm font-semibold ml-2 ${isOverLimit ? 'text-red-700' : isNearLimit ? 'text-amber-700' : 'text-gray-700'}`}>
            {isOverLimit ? 'Storage Full' : isNearLimit ? 'Storage Almost Full' : 'Storage Usage'}
          </Text>
        </View>

        <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, percentUsed)}%`,
              backgroundColor: progressColor,
            }}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-gray-500">
            {formatStorageSize(storageUsedBytes)} of {formatStorageSize(storageLimitBytes)} used
          </Text>
          <Text className="text-xs text-gray-500">
            {percentUsed.toFixed(0)}%
          </Text>
        </View>

        {(isNearLimit || isOverLimit) && (
          <TouchableOpacity
            onPress={handleUpgrade}
            className={`mt-3 py-2 rounded-lg items-center ${isOverLimit ? 'bg-red-500' : 'bg-amber-500'}`}
          >
            <Text className="text-sm font-medium text-white">
              {isOverLimit ? 'Upgrade to Continue Uploading' : 'Upgrade for More Storage'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, FileText, Image, File as FileIcon, Video } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import type { File, FileType } from '@ppa/interfaces';

interface RecentSectionProps {
  onFilePress: (file: File) => void;
}

function getFileIcon(type: FileType) {
  const iconProps = { size: 20 };
  switch (type) {
    case 'pdf':
      return <FileText {...iconProps} color="#dc2626" />;
    case 'image':
      return <Image {...iconProps} color="#16a34a" />;
    case 'video':
      return <Video {...iconProps} color="#9333ea" />;
    case 'document':
      return <FileIcon {...iconProps} color={COLORS.primary} />;
    default:
      return <FileIcon {...iconProps} color={COLORS.textMuted} />;
  }
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecentSection({ onFilePress }: RecentSectionProps) {
  const recentFiles = useAppStore((state) => state.recentFiles);

  if (recentFiles.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-3 px-5">
        <Clock size={16} color={COLORS.textMuted} />
        <Text className="text-sm font-semibold text-gray-700 ml-2">Recent</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5"
        contentContainerStyle={{ gap: 12 }}
      >
        {recentFiles.map((file) => (
          <TouchableOpacity
            key={file.id}
            onPress={() => onFilePress(file)}
            className="bg-white rounded-xl p-3 w-32 shadow-sm"
          >
            <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center mb-2">
              {getFileIcon(file.type)}
            </View>
            <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
              {file.name}
            </Text>
            {file.lastAccessedAt && (
              <Text className="text-xs text-gray-400 mt-1">
                {formatRelativeTime(file.lastAccessedAt)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

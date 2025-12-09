import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import { Star, FileText, Image, File as FileIcon, Video } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import type { File, FileType } from '@ppa/interfaces';

interface FavoritesSectionProps {
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

export function FavoritesSection({ onFilePress }: FavoritesSectionProps) {
  const favoriteFiles = useAppStore((state) => state.favoriteFiles);

  if (favoriteFiles.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-3 px-5">
        <Star size={16} color="#f59e0b" fill="#f59e0b" />
        <Text className="text-sm font-semibold text-gray-700 ml-2">Favorites</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5"
        contentContainerStyle={{ gap: 12 }}
      >
        {favoriteFiles.slice(0, 10).map((file) => (
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
            {file.category && (
              <Text className="text-xs text-gray-500 mt-1 capitalize">
                {file.category}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

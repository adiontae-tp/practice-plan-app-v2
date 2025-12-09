import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';

type TPAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface TPAvatarProps {
  src?: string;
  name?: string;
  size?: TPAvatarSize;
  fallback?: string;
}

/**
 * TPAvatar - User avatar component with initials fallback
 * Shows user image or initials when no image is available
 *
 * @example
 * <TPAvatar src={user.photoURL} name={user.name} size="md" />
 * <TPAvatar name="John Doe" size="lg" />
 */
export function TPAvatar({
  src,
  name,
  size = 'md',
  fallback,
}: TPAvatarProps) {
  // Generate initials from name
  const getInitials = (nameStr?: string): string => {
    if (!nameStr) return fallback || '?';

    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 0) return fallback || '?';

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <Avatar size={size}>
      {src ? <AvatarImage source={{ uri: src }} alt={name || 'Avatar'} /> : null}
      <AvatarFallbackText>{fallback || getInitials(name)}</AvatarFallbackText>
    </Avatar>
  );
}

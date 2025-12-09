import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Copy,
  Megaphone,
  FolderOpen,
  Tag,
  Users,
  BarChart3,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { FeatureFlags } from '@ppa/subscription';

export interface NavItem {
  label: string;
  route: string;
  icon: LucideIcon;
  description?: string;
  showOnMobile?: boolean;
  adminOnly?: boolean;
  /** Feature flag key that gates this item - if set, item shows locked for free users */
  requiredFeature?: keyof FeatureFlags;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const sidebarSections: NavSection[] = [
  {
    title: 'Planning',
    items: [
      {
        label: 'Period Templates',
        route: '/period-templates',
        icon: ClipboardList,
        description: 'Reusable drills and activities',
      },
      {
        label: 'Practice Templates',
        route: '/practice-templates',
        icon: Copy,
        description: 'Save complete practice plans',
        requiredFeature: 'canCreateTemplates',
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        label: 'Announcements',
        route: '/announcements',
        icon: Megaphone,
        description: 'Share updates with your team',
        requiredFeature: 'canCreateAnnouncements',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Files',
        route: '/files',
        icon: FolderOpen,
        description: 'Store and organize documents',
        requiredFeature: 'canUploadFiles',
      },
      {
        label: 'Tags',
        route: '/tags',
        icon: Tag,
        description: 'Track time by category',
        requiredFeature: 'canCreateTags',
      },
      {
        label: 'Assistant Coaches',
        route: '/coaches',
        icon: Users,
        description: 'Collaborate with your staff',
        adminOnly: true,
      },
      {
        label: 'Reports',
        route: '/reports',
        icon: BarChart3,
        description: 'View practice time distribution',
        requiredFeature: 'canViewAnalytics',
      },
    ],
  },
];

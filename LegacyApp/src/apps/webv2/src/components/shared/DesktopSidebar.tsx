import {
  LayoutDashboard,
  Calendar,
  Clock,
  FileText,
  Tags,
  Users,
  FolderOpen,
  Megaphone,
  BarChart3,
  User,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

const navItems: NavItem[] = [
  // Planning
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Planning' },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'periods', label: 'Period Templates', icon: Clock },
  { id: 'templates', label: 'Practice Templates', icon: FileText },
  // Communication
  { id: 'announcements', label: 'Announcements', icon: Megaphone, section: 'Communication' },
  // Management
  { id: 'files', label: 'Files', icon: FolderOpen, section: 'Management' },
  { id: 'tags', label: 'Tags', icon: Tags },
  { id: 'coaches', label: 'Coaches', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  // Settings
  { id: 'profile', label: 'Profile', icon: User, section: 'Settings' },
  { id: 'team', label: 'Team Settings', icon: Settings },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
];

export function DesktopSidebar({
  collapsed,
  onToggle,
  currentPage,
  onNavigate,
}: DesktopSidebarProps) {
  let currentSection = '';

  return (
    <aside
      className={cn(
        'h-full bg-white border-r border-outline-100 flex flex-col transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-outline-100">
        {!collapsed && (
          <span className="font-semibold text-primary-500">Practice Plan</span>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-background-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-typography-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-typography-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const showSection = item.section && item.section !== currentSection;
          if (showSection) {
            currentSection = item.section!;
          }

          return (
            <div key={item.id}>
              {showSection && !collapsed && (
                <div className="px-4 py-2 text-xs font-medium text-typography-500 uppercase tracking-wider">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 transition-colors',
                  currentPage === item.id
                    ? 'bg-primary-500 text-white'
                    : 'text-typography-700 hover:bg-background-100'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-outline-100">
          <p className="text-xs text-typography-500">v2.0.0</p>
        </div>
      )}
    </aside>
  );
}

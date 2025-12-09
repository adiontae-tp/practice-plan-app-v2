import { Menu, Bell, Search, User } from 'lucide-react';

interface DesktopHeaderProps {
  onToggleSidebar: () => void;
}

export function DesktopHeader({ onToggleSidebar }: DesktopHeaderProps) {
  return (
    <header className="h-16 bg-primary-500 flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Team selector placeholder */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-600 text-white">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
            T
          </div>
          <span className="text-sm font-medium">Team Name</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-primary-600 transition-colors">
          <Search className="w-5 h-5 text-white" />
        </button>
        <button className="p-2 rounded-lg hover:bg-primary-600 transition-colors relative">
          <Bell className="w-5 h-5 text-white" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-secondary-500 rounded-full" />
        </button>
        <button className="p-2 rounded-lg hover:bg-primary-600 transition-colors">
          <User className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User, Settings, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppStore } from '@ppa/store';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationDropdown } from './NotificationDropdown';

export interface TPHeaderProps {
  teamName?: string;
  teamLogoUrl?: string;
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  isLoading?: boolean;
}

export function TPHeader({
  teamName = 'Team Name',
  teamLogoUrl,
  userName = 'User',
  userEmail = 'user@example.com',
  userAvatarUrl,
  isLoading = false,
}: TPHeaderProps) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const router = useRouter();
  const logoutUser = useAppStore((state) => state.logoutUser);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <header className="h-16 bg-primary-500 text-white flex items-center justify-between px-4 shrink-0 shadow-md">
      {/* Left: Sidebar trigger + Team Selector */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-white hover:bg-white/15 hover:text-white transition-colors" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/15 hover:text-white gap-2 px-3 py-2 rounded-lg transition-all h-auto"
            >
              {isLoading ? (
                <>
                  <Skeleton className="w-8 h-8 rounded-lg bg-white/20" />
                  <div className="flex flex-col items-start gap-1">
                    <Skeleton className="h-4 w-24 bg-white/20" />
                    <Skeleton className="h-3 w-12 bg-white/20" />
                  </div>
                </>
              ) : (
                <>
                  {teamLogoUrl ? (
                    <img 
                      src={teamLogoUrl} 
                      alt={teamName} 
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                      {teamName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold leading-tight">{teamName}</span>
                    <span className="text-xs text-white/70 leading-tight">Active</span>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-1 text-white/70" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
              Switch Team
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              {teamName}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Actions + User Menu */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/15 hover:text-white rounded-lg transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </Button>
        <NotificationDropdown />

        <div className="w-px h-8 bg-white/30 mx-2 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/15 hover:text-white gap-2 pl-2 pr-3 py-2 rounded-lg transition-all h-auto"
            >
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
                  <div className="hidden sm:flex flex-col items-start gap-1">
                    <Skeleton className="h-4 w-20 bg-white/20" />
                    <Skeleton className="h-3 w-12 bg-white/20" />
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="h-8 w-8 border-2 border-white/30">
                    <AvatarImage src={userAvatarUrl} alt={userName} />
                    <AvatarFallback className="bg-secondary-500 text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium leading-tight">{userName}</span>
                    <span className="text-xs text-white/70 leading-tight">Admin</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/70 hidden sm:block" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleNavigate('/profile')}
            >
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleNavigate('/team')}
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 text-destructive cursor-pointer focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

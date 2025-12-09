import { App, View, Toolbar, Link } from 'framework7-react';
import Framework7 from 'framework7/lite';
import Framework7React from 'framework7-react';
import { Toaster } from 'sonner';
import { ClipboardList, Calendar, LayoutGrid } from 'lucide-react';

import { useDevice } from '@/hooks/useDevice';
import { useAppState } from '@/hooks/useAppState';
import { DesktopLayout } from '@/layouts/DesktopLayout';
import { AppProvider } from '@/components/providers';
import { routes } from '@/lib/routes';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

// Initialize Framework7-React plugin
Framework7.use(Framework7React);

// Framework7 app parameters for mobile
const f7params = {
  name: 'Practice Plan App',
  theme: 'ios',
  routes,
};

/**
 * AppContent - Main app content with viewport-based layout switching
 *
 * Mobile (< 768px): Framework7 with bottom tabs
 * Desktop (≥ 768px): shadcn/ui with sidebar
 */
function AppContent() {
  const { isMobile } = useDevice();
  const { isLoading } = useAppState();

  // Show loading screen while app initializes
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Mobile layout: Framework7 with native iOS feel
  if (isMobile) {
    return (
      <App {...f7params}>
        {/* Main View with Framework7 routing */}
        <View
          main
          url="/"
          iosDynamicNavbar={true}
          animate={true}
          browserHistory={true}
          browserHistoryRoot="/"
        />

        {/* Bottom Toolbar with tabs - matches native mobile app */}
        <Toolbar tabbar bottom className="toolbar-bottom">
          <Link tabLink href="/" text="Practice" iconOnly>
            <ClipboardList size={24} />
          </Link>
          <Link tabLink href="/calendar/" text="Calendar" iconOnly>
            <Calendar size={24} />
          </Link>
          <Link tabLink href="/menu/" text="Menu" iconOnly>
            <LayoutGrid size={24} />
          </Link>
        </Toolbar>
      </App>
    );
  }

  // Desktop layout: shadcn/ui with sidebar
  return <DesktopLayout />;
}

export default function AppRoot() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}

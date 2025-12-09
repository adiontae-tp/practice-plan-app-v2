import { useState } from 'react';
import { DesktopSidebar } from '@/components/shared/DesktopSidebar';
import { DesktopHeader } from '@/components/shared/DesktopHeader';
import { DesktopContent } from '@/components/shared/DesktopContent';

/**
 * Desktop layout with sidebar, header, and content area
 * Uses shadcn/ui components for desktop interface
 */
export function DesktopLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="h-screen flex bg-background-50">
      {/* Sidebar */}
      <DesktopSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DesktopHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <DesktopContent page={currentPage} />
        </main>
      </div>
    </div>
  );
}

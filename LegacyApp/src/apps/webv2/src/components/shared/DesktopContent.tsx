interface DesktopContentProps {
  page: string;
}

/**
 * Desktop content area - renders the appropriate page component
 * This will be expanded as we add more desktop pages
 */
export function DesktopContent({ page }: DesktopContentProps) {
  return (
    <div className="h-full">
      {page === 'dashboard' && <DashboardPage />}
      {page === 'calendar' && <PlaceholderPage title="Calendar" />}
      {page === 'periods' && <PlaceholderPage title="Period Templates" />}
      {page === 'templates' && <PlaceholderPage title="Practice Templates" />}
      {page === 'announcements' && <PlaceholderPage title="Announcements" />}
      {page === 'files' && <PlaceholderPage title="Files" />}
      {page === 'tags' && <PlaceholderPage title="Tags" />}
      {page === 'coaches' && <PlaceholderPage title="Coaches" />}
      {page === 'reports' && <PlaceholderPage title="Reports" />}
      {page === 'profile' && <PlaceholderPage title="Profile" />}
      {page === 'team' && <PlaceholderPage title="Team Settings" />}
      {page === 'subscription' && <PlaceholderPage title="Subscription" />}
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-typography-900">Dashboard</h1>
        <p className="text-typography-600">Welcome to Practice Plan App v2</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Today's Practices" value="2" />
        <StatCard title="This Week" value="8" />
        <StatCard title="Total Templates" value="12" />
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-xl border border-outline-100 p-6">
        <h2 className="text-lg font-medium text-typography-900 mb-4">
          Recent Practices
        </h2>
        <p className="text-typography-500">No practices scheduled for today.</p>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-outline-100 p-6">
      <p className="text-sm text-typography-600">{title}</p>
      <p className="text-3xl font-semibold text-typography-900 mt-1">{value}</p>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-typography-900">{title}</h1>
        <p className="text-typography-600">This page is under construction.</p>
      </div>

      <div className="bg-white rounded-xl border border-outline-100 p-12 text-center">
        <p className="text-typography-500">
          Desktop view for {title} will be implemented here.
        </p>
      </div>
    </div>
  );
}

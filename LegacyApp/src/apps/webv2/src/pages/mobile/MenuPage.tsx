import { Page, Navbar, Block } from 'framework7-react';
import {
  ClipboardList,
  Copy,
  Megaphone,
  FolderOpen,
  Tag,
  Users,
  BarChart3,
  User,
  Settings,
  CreditCard,
} from 'lucide-react';

/**
 * Mobile menu page - Navigation hub (matches MenuMobile from native app)
 */
export default function MenuPage() {
  const menuSections = [
    {
      title: 'Planning',
      items: [
        {
          label: 'Period Templates',
          route: '/periods/',
          icon: ClipboardList,
          description: 'Reusable drills and activities',
        },
        {
          label: 'Practice Templates',
          route: '/templates/',
          icon: Copy,
          description: 'Save complete practice plans',
        },
      ],
    },
    {
      title: 'Communication',
      items: [
        {
          label: 'Announcements',
          route: '/announcements/',
          icon: Megaphone,
          description: 'Share updates with your team',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          label: 'Files',
          route: '/files/',
          icon: FolderOpen,
          description: 'Store and organize documents',
        },
        {
          label: 'Tags',
          route: '/tags/',
          icon: Tag,
          description: 'Track time by category',
        },
        {
          label: 'Assistant Coaches',
          route: '/coaches/',
          icon: Users,
          description: 'Collaborate with your staff',
        },
        {
          label: 'Reports',
          route: '/reports/',
          icon: BarChart3,
          description: 'View practice time distribution',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          label: 'Profile',
          route: '/profile/',
          icon: User,
          description: 'Manage your account',
        },
        {
          label: 'Team Settings',
          route: '/team/',
          icon: Settings,
          description: 'Configure team preferences',
        },
        {
          label: 'Subscription',
          route: '/subscription/',
          icon: CreditCard,
          description: 'Manage your plan',
        },
      ],
    },
  ];

  return (
    <Page name="menu" className="!bg-[#e0e0e0]">
      <Navbar title="Menu" />

      <div className="px-5 pt-5 pb-10">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <p className="px-1 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.route}
                  href={item.route}
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm flex items-center no-underline active:opacity-70"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon size={20} color="#666666" />
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="text-base font-semibold text-gray-900 mb-0.5">
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        ))}

        {/* Version Info */}
        <Block className="!mt-4 !mb-4">
          <p className="text-xs text-gray-400 text-center">Version 2.0.0 (1)</p>
          <p className="text-xs text-gray-400 text-center mt-1">Runtime: 2.0.0</p>
        </Block>
      </div>
    </Page>
  );
}

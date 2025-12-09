import type { Router } from 'framework7/types';

// Lazy load pages for better performance
const HomePage = () => import('@/pages/mobile/HomePage');
const CalendarPage = () => import('@/pages/mobile/CalendarPage');
const MenuPage = () => import('@/pages/mobile/MenuPage');
const PeriodsPage = () => import('@/pages/mobile/PeriodsPage');
const TemplatesPage = () => import('@/pages/mobile/TemplatesPage');
const TagsPage = () => import('@/pages/mobile/TagsPage');
const CoachesPage = () => import('@/pages/mobile/CoachesPage');
const FilesPage = () => import('@/pages/mobile/FilesPage');
const AnnouncementsPage = () => import('@/pages/mobile/AnnouncementsPage');
const ProfilePage = () => import('@/pages/mobile/ProfilePage');
const TeamPage = () => import('@/pages/mobile/TeamPage');
const PlanDetailPage = () => import('@/pages/mobile/PlanDetailPage');
const NotFoundPage = () => import('@/pages/mobile/NotFoundPage');

/**
 * Framework7 routes for mobile views
 * These routes are used when the device is detected as mobile
 */
export const routes: Router.RouteParameters[] = [
  // Tab pages
  {
    path: '/',
    asyncComponent: HomePage,
  },
  {
    path: '/calendar/',
    asyncComponent: CalendarPage,
  },
  {
    path: '/menu/',
    asyncComponent: MenuPage,
  },

  // Feature pages (accessed from menu)
  {
    path: '/periods/',
    asyncComponent: PeriodsPage,
  },
  {
    path: '/templates/',
    asyncComponent: TemplatesPage,
  },
  {
    path: '/tags/',
    asyncComponent: TagsPage,
  },
  {
    path: '/coaches/',
    asyncComponent: CoachesPage,
  },
  {
    path: '/files/',
    asyncComponent: FilesPage,
  },
  {
    path: '/announcements/',
    asyncComponent: AnnouncementsPage,
  },
  {
    path: '/profile/',
    asyncComponent: ProfilePage,
  },
  {
    path: '/team/',
    asyncComponent: TeamPage,
  },

  // Detail pages
  {
    path: '/plan/:id/',
    asyncComponent: PlanDetailPage,
  },

  // 404
  {
    path: '(.*)',
    asyncComponent: NotFoundPage,
  },
];

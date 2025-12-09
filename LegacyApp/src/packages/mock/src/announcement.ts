export type AnnouncementPriority = 'high' | 'medium' | 'low';

export interface MockAnnouncement {
  id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  createdAt: number;
  createdBy: string;
  isRead: boolean;
}

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const mockAnnouncements: MockAnnouncement[] = [
  {
    id: 'ann-001',
    title: 'Practice Cancelled Tomorrow',
    message: 'Due to the gym being used for the school assembly, tomorrow\'s practice has been cancelled. Please use this time to rest and recover. We\'ll resume regular practice on Thursday.',
    priority: 'high',
    createdAt: now - 2 * 60 * 60 * 1000, // 2 hours ago
    createdBy: 'Coach Smith',
    isRead: false,
  },
  {
    id: 'ann-002',
    title: 'New Practice Schedule',
    message: 'Starting next week, we will have practice on Tuesday and Thursday evenings instead of Monday and Wednesday. This change is to accommodate the new gym schedule.',
    priority: 'medium',
    createdAt: now - day, // 1 day ago
    createdBy: 'Coach Smith',
    isRead: false,
  },
  {
    id: 'ann-003',
    title: 'Uniform Distribution',
    message: 'New team uniforms have arrived! Please pick up your uniform from the equipment room during your next practice session. See Coach Johnson if you need a different size.',
    priority: 'low',
    createdAt: now - 2 * day, // 2 days ago
    createdBy: 'Coach Johnson',
    isRead: true,
  },
  {
    id: 'ann-004',
    title: 'Game Day Reminder',
    message: 'Don\'t forget: Our first game of the season is this Saturday at 2 PM against Central High. Players should arrive by 1 PM for warm-ups. Family and friends are welcome!',
    priority: 'high',
    createdAt: now - 3 * day, // 3 days ago
    createdBy: 'Coach Smith',
    isRead: true,
  },
  {
    id: 'ann-005',
    title: 'Team Fundraiser',
    message: 'We are hosting a car wash fundraiser next Sunday from 9 AM to 3 PM at the school parking lot. All players are expected to participate for at least a 2-hour shift.',
    priority: 'medium',
    createdAt: now - 5 * day, // 5 days ago
    createdBy: 'Coach Johnson',
    isRead: true,
  },
];

import { Plan } from '@ppa/interfaces';
import { mockActivity } from './activity';
import { mockTag } from './tag';

// Helper to create date timestamps for the current month
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();

function createTimestamp(day: number, hour: number, minute = 0): number {
  return new Date(year, month, day, hour, minute).getTime();
}

// Create mock activities for variety
const warmupActivity = {
  ...mockActivity,
  id: 'activity-warmup',
  name: 'Warm-up',
  duration: 15,
};

const drillsActivity = {
  ...mockActivity,
  id: 'activity-drills',
  name: 'Drills',
  duration: 30,
};

const scrimmageActivity = {
  ...mockActivity,
  id: 'activity-scrimmage',
  name: 'Scrimmage',
  duration: 45,
};

const cooldownActivity = {
  ...mockActivity,
  id: 'activity-cooldown',
  name: 'Cool-down',
  duration: 10,
};

// Generate mock plans for the calendar
export const mockCalendarPlans: Plan[] = [
  // Monday plans (today - 2)
  {
    id: 'plan-cal-001',
    uid: 'user-001',
    ref: 'teams/team-001/plans/plan-cal-001' as any,
    startTime: createTimestamp(now.getDate() - 2, 14, 0), // 2:00 PM
    endTime: createTimestamp(now.getDate() - 2, 15, 30),  // 3:30 PM
    duration: 90,
    activities: [warmupActivity, drillsActivity, scrimmageActivity],
    tags: [mockTag],
    notes: '<p>Focus on <strong>fundamentals</strong></p>',
    readonly: false,
    col: 'plans',
  },
  {
    id: 'plan-cal-002',
    uid: 'user-001',
    ref: 'teams/team-001/plans/plan-cal-002' as any,
    startTime: createTimestamp(now.getDate() - 2, 17, 0), // 5:00 PM
    endTime: createTimestamp(now.getDate() - 2, 18, 0),   // 6:00 PM
    duration: 60,
    activities: [warmupActivity, drillsActivity],
    tags: [mockTag],
    notes: '<p>Evening skill work</p>',
    readonly: false,
    col: 'plans',
  },
  // Today's plans
  {
    id: 'plan-cal-003',
    uid: 'user-001',
    ref: 'teams/team-001/plans/plan-cal-003' as any,
    startTime: createTimestamp(now.getDate(), 10, 0), // 10:00 AM
    endTime: createTimestamp(now.getDate(), 12, 0),   // 12:00 PM
    duration: 120,
    activities: [warmupActivity, drillsActivity, scrimmageActivity, cooldownActivity],
    tags: [mockTag],
    notes: '<p>Full team practice</p>',
    readonly: false,
    col: 'plans',
  },
  // Tomorrow
  {
    id: 'plan-cal-004',
    uid: 'user-001',
    ref: 'teams/team-001/plans/plan-cal-004' as any,
    startTime: createTimestamp(now.getDate() + 1, 15, 0), // 3:00 PM
    endTime: createTimestamp(now.getDate() + 1, 17, 0),   // 5:00 PM
    duration: 120,
    activities: [warmupActivity, scrimmageActivity, cooldownActivity],
    tags: [mockTag],
    notes: '<p>Game preparation</p>',
    readonly: false,
    col: 'plans',
  },
  // Day after tomorrow
  {
    id: 'plan-cal-005',
    uid: 'user-001',
    ref: 'teams/team-001/plans/plan-cal-005' as any,
    startTime: createTimestamp(now.getDate() + 2, 14, 0), // 2:00 PM
    endTime: createTimestamp(now.getDate() + 2, 15, 30),  // 3:30 PM
    duration: 90,
    activities: [warmupActivity, drillsActivity],
    tags: [mockTag],
    notes: '<p>Light practice</p>',
    readonly: false,
    col: 'plans',
  },
  // Weekend (add 4-5 days)
  {
    id: 'plan-cal-006',
    uid: 'user-001',
    ref: 'teams/team-001/plans/plan-cal-006' as any,
    startTime: createTimestamp(now.getDate() + 4, 9, 0),  // 9:00 AM
    endTime: createTimestamp(now.getDate() + 4, 11, 0),   // 11:00 AM
    duration: 120,
    activities: [warmupActivity, drillsActivity, scrimmageActivity, cooldownActivity],
    tags: [mockTag],
    notes: '<p>Weekend training session</p>',
    readonly: false,
    col: 'plans',
  },
  // Last week (for month view testing)
  {
    id: 'plan-cal-007',
    uid: 'user-001',
    ref: 'teams/team-001/plans/plan-cal-007' as any,
    startTime: createTimestamp(now.getDate() - 7, 14, 0), // 2:00 PM
    endTime: createTimestamp(now.getDate() - 7, 16, 0),   // 4:00 PM
    duration: 120,
    activities: [warmupActivity, drillsActivity, scrimmageActivity],
    tags: [mockTag],
    notes: '<p>Last week practice</p>',
    readonly: false,
    col: 'plans',
  },
  {
    id: 'plan-cal-008',
    uid: 'user-001',
    ref: 'teams/team-001/plans/plan-cal-008' as any,
    startTime: createTimestamp(now.getDate() - 5, 16, 0), // 4:00 PM
    endTime: createTimestamp(now.getDate() - 5, 17, 30),  // 5:30 PM
    duration: 90,
    activities: [warmupActivity, drillsActivity],
    tags: [mockTag],
    notes: '<p>Midweek session</p>',
    readonly: false,
    col: 'plans',
  },
];

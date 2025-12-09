import { Plan } from '@ppa/interfaces';
import { mockActivity } from './activity';
import { mockTag } from './tag';

export const mockPlan: Plan = {
  id: 'plan-001',
  uid: 'user-001',
  ref: 'teams/team-001/plans/plan-001' as any,
  startTime: 1700000000000,
  endTime: 1700007200000,
  duration: 120,
  activities: [mockActivity],
  tags: [mockTag],
  notes: '<p>Pre-season <strong>conditioning</strong> practice</p>',
  readonly: false,
  col: 'plans',
};

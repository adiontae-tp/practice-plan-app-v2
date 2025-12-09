import { Activity } from '@ppa/interfaces';
import { mockTag } from './tag';

export const mockActivity: Activity = {
  id: 'activity-001',
  name: 'Passing Drill',
  startTime: 1700000000000,
  endTime: 1700000900000,
  duration: 15,
  notes: '<p>Focus on <strong>quick release</strong> and accuracy</p>',
  tags: [mockTag],
};

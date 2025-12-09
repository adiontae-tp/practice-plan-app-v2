import { Template } from '@ppa/interfaces';
import { mockActivity } from './activity';
import { mockTag, mockTags } from './tag';

export const mockTemplate: Template = {
  id: 'template-001',
  ref: 'teams/team-001/templates/template-001' as any,
  name: 'Standard Practice',
  duration: 90,
  col: 'templates',
  activities: [mockActivity],
  tags: [mockTag],
};

export const mockTemplates: Template[] = [
  {
    id: 'template-001',
    ref: 'teams/team-001/templates/template-001' as any,
    name: 'Standard Practice',
    duration: 90,
    col: 'templates',
    activities: [
      { id: 'act-1', name: 'Warm Up', startTime: 0, endTime: 0, duration: 10, notes: '', tags: [mockTags[0]] },
      { id: 'act-2', name: 'Ball Handling', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [mockTags[2]] },
      { id: 'act-3', name: 'Shooting Drills', startTime: 0, endTime: 0, duration: 20, notes: '', tags: [mockTags[2], mockTags[3]] },
      { id: 'act-4', name: '5v5 Scrimmage', startTime: 0, endTime: 0, duration: 30, notes: '', tags: [mockTags[1], mockTags[3]] },
      { id: 'act-5', name: 'Cool Down', startTime: 0, endTime: 0, duration: 10, notes: '', tags: [mockTags[5]] },
    ],
    tags: [mockTags[0], mockTags[2]],
  },
  {
    id: 'template-002',
    ref: 'teams/team-001/templates/template-002' as any,
    name: 'Game Day Prep',
    duration: 60,
    col: 'templates',
    activities: [
      { id: 'act-6', name: 'Light Warm Up', startTime: 0, endTime: 0, duration: 10, notes: '', tags: [mockTags[0]] },
      { id: 'act-7', name: 'Shooting Practice', startTime: 0, endTime: 0, duration: 20, notes: '', tags: [mockTags[2]] },
      { id: 'act-8', name: 'Play Review', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [mockTags[3]] },
      { id: 'act-9', name: 'Team Talk', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [] },
    ],
    tags: [mockTags[3]],
  },
  {
    id: 'template-003',
    ref: 'teams/team-001/templates/template-003' as any,
    name: 'Conditioning Focus',
    duration: 75,
    col: 'templates',
    activities: [
      { id: 'act-10', name: 'Dynamic Stretching', startTime: 0, endTime: 0, duration: 10, notes: '', tags: [mockTags[6]] },
      { id: 'act-11', name: 'Suicides', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [mockTags[0]] },
      { id: 'act-12', name: 'Ladder Drills', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [mockTags[0], mockTags[2]] },
      { id: 'act-13', name: 'Full Court Sprints', startTime: 0, endTime: 0, duration: 20, notes: '', tags: [mockTags[0]] },
      { id: 'act-14', name: 'Recovery Stretch', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [mockTags[5], mockTags[6]] },
    ],
    tags: [mockTags[0]],
  },
  {
    id: 'template-004',
    ref: 'teams/team-001/templates/template-004' as any,
    name: 'Defense Drill Day',
    duration: 80,
    col: 'templates',
    activities: [
      { id: 'act-15', name: 'Warm Up', startTime: 0, endTime: 0, duration: 10, notes: '', tags: [mockTags[6]] },
      { id: 'act-16', name: 'Defensive Slides', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [mockTags[1]] },
      { id: 'act-17', name: 'Close-out Drills', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [mockTags[1], mockTags[2]] },
      { id: 'act-18', name: 'Shell Drill', startTime: 0, endTime: 0, duration: 20, notes: '', tags: [mockTags[1]] },
      { id: 'act-19', name: '3v3 Defensive', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [mockTags[1], mockTags[3]] },
      { id: 'act-20', name: 'Cool Down', startTime: 0, endTime: 0, duration: 5, notes: '', tags: [mockTags[5]] },
    ],
    tags: [mockTags[1]],
  },
  {
    id: 'template-005',
    ref: 'teams/team-001/templates/template-005' as any,
    name: 'Skills Development',
    duration: 90,
    col: 'templates',
    activities: [
      { id: 'act-21', name: 'Warm Up', startTime: 0, endTime: 0, duration: 10, notes: '', tags: [mockTags[6]] },
      { id: 'act-22', name: 'Ball Handling Circuit', startTime: 0, endTime: 0, duration: 20, notes: '', tags: [mockTags[4]] },
      { id: 'act-23', name: 'Passing Drills', startTime: 0, endTime: 0, duration: 15, notes: '', tags: [mockTags[4]] },
      { id: 'act-24', name: 'Shooting Stations', startTime: 0, endTime: 0, duration: 25, notes: '', tags: [mockTags[4], mockTags[3]] },
      { id: 'act-25', name: 'Free Throw Practice', startTime: 0, endTime: 0, duration: 10, notes: '', tags: [mockTags[4]] },
      { id: 'act-26', name: 'Cool Down', startTime: 0, endTime: 0, duration: 10, notes: '', tags: [mockTags[5]] },
    ],
    tags: [mockTags[4]],
  },
];

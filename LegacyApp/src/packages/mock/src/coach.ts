import { Coach } from '@ppa/interfaces';

export const mockCoach: Coach = {
  id: 'coach-001',
  email: 'coach@example.com',
  ref: 'coaches/coach-001' as any,
  col: 'coaches',
};

export type MockCoachPermission = 'admin' | 'edit' | 'view';
export type MockCoachStatus = 'active' | 'invited' | 'inactive';

export interface MockCoachWithDetails extends Coach {
  permission: MockCoachPermission;
  status: MockCoachStatus;
}

export const mockCoaches: MockCoachWithDetails[] = [
  {
    id: 'coach-001',
    email: 'john@example.com',
    ref: 'coaches/coach-001' as any,
    col: 'coaches',
    permission: 'admin',
    status: 'active',
  },
  {
    id: 'coach-002',
    email: 'jane@example.com',
    ref: 'coaches/coach-002' as any,
    col: 'coaches',
    permission: 'edit',
    status: 'active',
  },
  {
    id: 'coach-003',
    email: 'mike@example.com',
    ref: 'coaches/coach-003' as any,
    col: 'coaches',
    permission: 'view',
    status: 'invited',
  },
];

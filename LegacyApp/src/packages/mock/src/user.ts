import { User } from '@ppa/interfaces';

export const mockUser: User = {
  fname: 'John',
  lname: 'Smith',
  isAdmin: 'false',
  tpNews: 1,
  entitlement: 1,
  stripeEntitlement: 1,
  created: 1700000000000,
  modified: 1700000000000,
  uid: 'user-001',
  email: 'john.smith@example.com',
  path: 'users/user-001',
  teamRef: 'teams/team-001' as any,
  ref: 'users/user-001' as any,
};

export interface MockPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  limitations: string[];
  isCurrent: boolean;
  isPopular: boolean;
}

export const mockPlans: MockPlan[] = [
  {
    id: 'plan-free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for getting started',
    features: [
      'Up to 5 practice plans',
      'Basic templates',
      'Email support',
    ],
    limitations: [
      'No team collaboration',
      'No advanced reports',
      'No file uploads',
    ],
    isCurrent: true,
    isPopular: false,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    description: 'For serious coaches',
    features: [
      'Unlimited practice plans',
      'Advanced templates',
      'Up to 3 team members',
      'Basic reports',
      'File uploads (100MB)',
      'Priority email support',
    ],
    limitations: [
      'Limited team size',
    ],
    isCurrent: false,
    isPopular: true,
  },
  {
    id: 'plan-team',
    name: 'Team',
    price: 29.99,
    interval: 'month',
    description: 'For entire coaching staffs',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Advanced analytics',
      'File uploads (1GB)',
      'Custom branding',
      'Phone support',
      'API access',
    ],
    limitations: [],
    isCurrent: false,
    isPopular: false,
  },
];

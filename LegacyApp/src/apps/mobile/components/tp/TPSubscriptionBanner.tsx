/**
 * TPSubscriptionBanner - Global subscription upgrade banner
 * Shows for free tier users to encourage upgrading
 */
import React from 'react';
import { TPUpgradeBanner } from './TPUpgradeBanner';
import { useSubscription } from '@/hooks/useSubscription';

export interface TPSubscriptionBannerProps {
  /** Custom message to display */
  message?: string;
}

export function TPSubscriptionBanner({ message }: TPSubscriptionBannerProps) {
  const { tier } = useSubscription();

  // Only show for free tier users
  if (tier !== 'free') return null;

  return <TPUpgradeBanner message={message} visible />;
}

export default TPSubscriptionBanner;

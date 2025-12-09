'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@ppa/store';
import { updateUserOnboardingStatus } from '@ppa/firebase';
import { WelcomeTour } from './WelcomeTour';
import { GuidedTour } from './GuidedTour';
import { toast } from 'sonner';

export interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const {
    user,
    startWelcomeTour,
    startGuidedTour,
    setWelcomeTourActive,
    setGuidedTourActive,
  } = useAppStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user should see onboarding on first load
  useEffect(() => {
    if (!user?.uid || isInitialized) return;

    const checkOnboardingStatus = async () => {
      try {
        // Check if user has completed welcome tour
        const hasCompletedWelcome = user.welcomeTourCompleted;
        const hasCompletedGuided = user.guidedTourCompleted;

        // If neither tour is completed, start welcome tour
        if (!hasCompletedWelcome && !hasCompletedGuided) {
          // Wait a bit for the page to fully load
          setTimeout(() => {
            startWelcomeTour();
          }, 1000);
        }
        // If welcome is completed but guided is not, start guided tour
        else if (hasCompletedWelcome && !hasCompletedGuided) {
          setTimeout(() => {
            startGuidedTour();
          }, 1000);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsInitialized(true);
      }
    };

    checkOnboardingStatus();
  }, [user, isInitialized, startWelcomeTour, startGuidedTour]);

  const handleWelcomeTourComplete = async () => {
    if (!user?.uid) return;

    try {
      // Update Firebase
      await updateUserOnboardingStatus(user.uid, {
        welcomeTourCompleted: true,
        welcomeTourCompletedAt: Date.now(),
      });

      // Start guided tour after welcome tour completes
      setTimeout(() => {
        startGuidedTour();
      }, 500);
    } catch (error) {
      console.error('Error updating welcome tour status:', error);
      toast.error('Failed to save tour progress');
    }
  };

  const handleWelcomeTourSkip = async () => {
    if (!user?.uid) return;

    try {
      // Mark as skipped in Firebase
      await updateUserOnboardingStatus(user.uid, {
        welcomeTourCompleted: true,
        welcomeTourCompletedAt: Date.now(),
        onboardingSkipped: true,
        onboardingSkippedAt: Date.now(),
      });

      setWelcomeTourActive(false);
      toast.info('You can replay the tour anytime from the Help page');
    } catch (error) {
      console.error('Error skipping welcome tour:', error);
    }
  };

  const handleGuidedTourComplete = async () => {
    if (!user?.uid) return;

    try {
      // Update Firebase
      await updateUserOnboardingStatus(user.uid, {
        guidedTourCompleted: true,
        guidedTourCompletedAt: Date.now(),
      });

      setGuidedTourActive(false);
      toast.success('Tour complete! You\'re all set to start planning practices');
    } catch (error) {
      console.error('Error updating guided tour status:', error);
      toast.error('Failed to save tour progress');
    }
  };

  return (
    <>
      {children}
      <WelcomeTour
        onComplete={handleWelcomeTourComplete}
        onSkip={handleWelcomeTourSkip}
      />
      <GuidedTour
        onComplete={handleGuidedTourComplete}
      />
    </>
  );
}

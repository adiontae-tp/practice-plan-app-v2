import React, { useEffect, useState } from 'react';
import { useAppStore } from '@ppa/store';
import { updateUserOnboardingStatus } from '@ppa/firebase';
import { WelcomeTour } from './WelcomeTour';
import { GuidedTour } from './GuidedTour';
import { useToast } from '../TPToast';

export interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const {
    user,
    welcomeTourActive,
    guidedTourActive,
    startWelcomeTour,
    startGuidedTour,
    setWelcomeTourActive,
    setGuidedTourActive,
  } = useAppStore();

  const { showToast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user should see onboarding on first load
  useEffect(() => {
    if (!user?.uid || isInitialized) return;

    const checkOnboardingStatus = async () => {
      try {
        // Check if user has completed onboarding survey and welcome tour
        const hasCompletedOnboarding = user.onboardingCompleted;
        const hasCompletedWelcome = user.welcomeTourCompleted;
        const hasCompletedGuided = user.guidedTourCompleted;

        // If onboarding survey is complete but tours are not, start welcome tour
        if (hasCompletedOnboarding && !hasCompletedWelcome && !hasCompletedGuided) {
          // Wait a bit for the app to fully load
          setTimeout(() => {
            startWelcomeTour();
          }, 1500);
        }
        // If welcome is completed but guided is not, start guided tour
        else if (hasCompletedWelcome && !hasCompletedGuided) {
          setTimeout(() => {
            startGuidedTour();
          }, 1500);
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

      setWelcomeTourActive(false);

      // Start guided tour after welcome tour completes
      setTimeout(() => {
        startGuidedTour();
      }, 500);
    } catch (error) {
      console.error('Error updating welcome tour status:', error);
      showToast({
        type: 'error',
        message: 'Failed to save tour progress',
      });
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
      showToast({
        type: 'info',
        message: 'You can replay the tour anytime from the Menu',
      });
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
      showToast({
        type: 'success',
        message: 'Tour complete! You\'re all set to start planning',
      });
    } catch (error) {
      console.error('Error updating guided tour status:', error);
      showToast({
        type: 'error',
        message: 'Failed to save tour progress',
      });
    }
  };

  return (
    <>
      {children}
      <WelcomeTour
        visible={welcomeTourActive}
        onComplete={handleWelcomeTourComplete}
        onSkip={handleWelcomeTourSkip}
      />
      <GuidedTour
        visible={guidedTourActive}
        onComplete={handleGuidedTourComplete}
      />
    </>
  );
}

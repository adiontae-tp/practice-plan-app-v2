'use client';

import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAppStore } from '@ppa/store';
import { COLORS } from '@/lib/colors';

export interface GuidedTourProps {
  onComplete: () => void;
}

const guidedSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'This is your dashboard. Here you can see today\'s practices and quick access to common actions.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="calendar-nav"]',
    content: 'Click here to view all your practices in a calendar view. See what\'s coming up and plan ahead.',
    placement: 'right',
  },
  {
    target: '[data-tour="new-plan-btn"]',
    content: 'Click this button to create your first practice plan. You can set the date, time, and duration.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="periods-nav"]',
    content: 'The period library contains all your reusable drills and activities. Create them once, use them many times.',
    placement: 'right',
  },
  {
    target: '[data-tour="templates-nav"]',
    content: 'Save complete practice plans as templates. Perfect for recurring practice structures.',
    placement: 'right',
  },
  {
    target: '[data-tour="tags-nav"]',
    content: 'Use tags to organize and categorize your plans, periods, and templates. Filter and search by tags.',
    placement: 'right',
  },
  {
    target: '[data-tour="coaches-nav"]',
    content: 'Invite assistant coaches to join your team. They can view or edit plans depending on their permissions.',
    placement: 'right',
  },
  {
    target: '[data-tour="files-nav"]',
    content: 'Store and share files with your coaching staff. Upload diagrams, playbooks, or any other resources.',
    placement: 'right',
  },
  {
    target: '[data-tour="announcements-nav"]',
    content: 'Post announcements to keep your coaching staff informed about important updates.',
    placement: 'right',
  },
  {
    target: '[data-tour="help-nav"]',
    content: 'Need help? Visit the Help page for FAQs and support. You can replay this tour anytime from there!',
    placement: 'right',
  },
];

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const { guidedTourActive, setGuidedTourActive, setGuidedTourCompleted } = useAppStore();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (guidedTourActive) {
      // Small delay to ensure DOM is ready and navigation is complete
      setTimeout(() => setRun(true), 500);
    } else {
      setRun(false);
    }
  }, [guidedTourActive]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    // Handle missing targets - skip to next step
    if (type === 'error:target_not_found') {
      console.warn('Guided tour target not found at step:', index);
      // Continue to next step automatically
      return;
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setGuidedTourActive(false);

      if (status === STATUS.FINISHED) {
        setGuidedTourCompleted(true);
        onComplete();
      }
    }
  };

  if (!guidedTourActive) return null;

  return (
    <Joyride
      steps={guidedSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableCloseOnEsc={false}
      disableOverlayClose={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: COLORS.primary,
          zIndex: 10000,
          arrowColor: '#fff',
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        tooltipContent: {
          padding: '10px 0',
        },
        buttonNext: {
          backgroundColor: COLORS.primary,
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 600,
        },
        buttonBack: {
          color: COLORS.textMuted,
          marginRight: 10,
        },
        buttonSkip: {
          color: COLORS.textMuted,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip',
      }}
    />
  );
}

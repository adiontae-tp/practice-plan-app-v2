'use client';

import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAppStore } from '@ppa/store';
import { COLORS } from '@/lib/colors';

export interface WelcomeTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const welcomeSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Practice Plan!</h2>
        <p className="text-gray-600">
          Let&apos;s take a quick tour to help you get started. We&apos;ll show you how to create practice plans,
          use templates, collaborate with your team, and more.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          This tour will only take a minute. You can skip it anytime.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Create Practice Plans</h2>
        <p className="text-gray-600">
          Click the "New Plan" button to create your first practice plan. Add periods, set durations,
          and organize your practice with tags.
        </p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>Drag and drop periods to reorder them</li>
          <li>Set start times and durations</li>
          <li>Add notes and tags for organization</li>
        </ul>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Templates & Period Library</h2>
        <p className="text-gray-600">
          Save time by creating reusable templates and period libraries:
        </p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li><strong>Period Templates:</strong> Common drills and activities you use often</li>
          <li><strong>Practice Templates:</strong> Full practice plans you can reuse</li>
          <li>Quickly build practices by selecting from your library</li>
        </ul>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Team Collaboration</h2>
        <p className="text-gray-600">
          Invite assistant coaches to collaborate on your team:
        </p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>Share practice plans with your coaching staff</li>
          <li>Give different permission levels (view or edit)</li>
          <li>Post announcements to keep everyone informed</li>
          <li>Share files and resources with the team</li>
        </ul>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">You&apos;re All Set!</h2>
        <p className="text-gray-600">
          That&apos;s the quick overview! Now let&apos;s take a guided tour of the app to show you exactly
          where everything is.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          You can replay this tour anytime from the Help page.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
];

export function WelcomeTour({ onComplete, onSkip }: WelcomeTourProps) {
  const { welcomeTourActive, setWelcomeTourActive } = useAppStore();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (welcomeTourActive) {
      // Small delay to ensure DOM is ready
      setTimeout(() => setRun(true), 300);
    } else {
      setRun(false);
    }
  }, [welcomeTourActive]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setWelcomeTourActive(false);

      if (status === STATUS.FINISHED) {
        onComplete();
      } else if (status === STATUS.SKIPPED) {
        onSkip();
      }
    }
  };

  if (!welcomeTourActive) return null;

  return (
    <Joyride
      steps={welcomeSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableCloseOnEsc
      disableOverlayClose
      hideCloseButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: COLORS.primary,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          padding: 24,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: COLORS.primary,
          borderRadius: 6,
          padding: '10px 20px',
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
        last: 'Start Guided Tour',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}

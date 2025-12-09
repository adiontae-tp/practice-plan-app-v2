import { StateCreator } from 'zustand';

export interface OnboardingUISlice {
  welcomeTourActive: boolean;
  welcomeTourStep: number;
  welcomeTourSkipped: boolean;
  guidedTourActive: boolean;
  guidedTourStep: number;
  guidedTourCompleted: boolean;
  tourMode: 'welcome' | 'guided' | null;

  setWelcomeTourActive: (active: boolean) => void;
  setWelcomeTourStep: (step: number) => void;
  setWelcomeTourSkipped: (skipped: boolean) => void;
  setGuidedTourActive: (active: boolean) => void;
  setGuidedTourStep: (step: number) => void;
  setGuidedTourCompleted: (completed: boolean) => void;
  setTourMode: (mode: 'welcome' | 'guided' | null) => void;
  startWelcomeTour: () => void;
  startGuidedTour: () => void;
  resetOnboardingUI: () => void;
}

const initialState = {
  welcomeTourActive: false,
  welcomeTourStep: 0,
  welcomeTourSkipped: false,
  guidedTourActive: false,
  guidedTourStep: 0,
  guidedTourCompleted: false,
  tourMode: null as 'welcome' | 'guided' | null,
};

export const createOnboardingUISlice: StateCreator<OnboardingUISlice> = (set) => ({
  ...initialState,

  setWelcomeTourActive: (active) => set({ welcomeTourActive: active }),
  setWelcomeTourStep: (step) => set({ welcomeTourStep: step }),
  setWelcomeTourSkipped: (skipped) => set({ welcomeTourSkipped: skipped }),
  setGuidedTourActive: (active) => set({ guidedTourActive: active }),
  setGuidedTourStep: (step) => set({ guidedTourStep: step }),
  setGuidedTourCompleted: (completed) => set({ guidedTourCompleted: completed }),
  setTourMode: (mode) => set({ tourMode: mode }),

  startWelcomeTour: () => set({
    welcomeTourActive: true,
    welcomeTourStep: 0,
    welcomeTourSkipped: false,
    tourMode: 'welcome'
  }),

  startGuidedTour: () => set({
    guidedTourActive: true,
    guidedTourStep: 0,
    tourMode: 'guided'
  }),

  resetOnboardingUI: () => set(initialState),
});

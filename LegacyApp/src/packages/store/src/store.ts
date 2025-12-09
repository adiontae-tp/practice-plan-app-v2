import { create } from 'zustand';
import {
  createAppSlice,
  createAuthSlice,
  createUserSlice,
  createTeamSlice,
  createPlanSlice,
  createPeriodSlice,
  createTemplateSlice,
  createTagSlice,
  createCoachSlice,
  createFileSlice,
  createFolderSlice,
  createFileVersionSlice,
  createFileShareSlice,
  createAnnouncementSlice,
  createSubscriptionSlice,
  createNavigationSlice,
  createTagsUISlice,
  createCoachesUISlice,
  createFilesUISlice,
  createCalendarUISlice,
  createPeriodsUISlice,
  createTemplatesUISlice,
  createAnnouncementsUISlice,
  createReportsUISlice,
  createProfileUISlice,
  createPdfUISlice,
  createOnboardingUISlice,
  createAdminSlice,
  type AppSlice,
  type AuthSlice,
  type UserSlice,
  type TeamSlice,
  type PlanSlice,
  type PeriodSlice,
  type TemplateSlice,
  type TagSlice,
  type CoachSlice,
  type FileSlice,
  type FolderSlice,
  type FileVersionSlice,
  type FileShareSlice,
  type AnnouncementSlice,
  type SubscriptionSlice,
  type NavigationState,
  type TagsUISlice,
  type CoachesUISlice,
  type FilesUISlice,
  type CalendarUISlice,
  type PeriodsUISlice,
  type TemplatesUISlice,
  type AnnouncementsUISlice,
  type ReportsUISlice,
  type ProfileUISlice,
  type PdfUISlice,
  type OnboardingUISlice,
  type AdminSlice,
} from './slices';

export type AppStore = AppSlice &
  AuthSlice &
  UserSlice &
  TeamSlice &
  PlanSlice &
  PeriodSlice &
  TemplateSlice &
  TagSlice &
  CoachSlice &
  FileSlice &
  FolderSlice &
  FileVersionSlice &
  FileShareSlice &
  AnnouncementSlice &
  SubscriptionSlice &
  NavigationState &
  TagsUISlice &
  CoachesUISlice &
  FilesUISlice &
  CalendarUISlice &
  PeriodsUISlice &
  TemplatesUISlice &
  AnnouncementsUISlice &
  ReportsUISlice &
  ProfileUISlice &
  PdfUISlice &
  OnboardingUISlice &
  AdminSlice;

export const useAppStore = create<AppStore>()((...a) => ({
  ...createAppSlice(...a),
  ...createAuthSlice(...a),
  ...createUserSlice(...a),
  ...createTeamSlice(...a),
  ...createPlanSlice(...a),
  ...createPeriodSlice(...a),
  ...createTemplateSlice(...a),
  ...createTagSlice(...a),
  ...createCoachSlice(...a),
  ...createFileSlice(...a),
  ...createFolderSlice(...a),
  ...createFileVersionSlice(...a),
  ...createFileShareSlice(...a),
  ...createAnnouncementSlice(...a),
  ...createSubscriptionSlice(...a),
  ...createNavigationSlice(...a),
  ...createTagsUISlice(...a),
  ...createCoachesUISlice(...a),
  ...createFilesUISlice(...a),
  ...createCalendarUISlice(...a),
  ...createPeriodsUISlice(...a),
  ...createTemplatesUISlice(...a),
  ...createAnnouncementsUISlice(...a),
  ...createReportsUISlice(...a),
  ...createProfileUISlice(...a),
  ...createPdfUISlice(...a),
  ...createOnboardingUISlice(...a),
  ...createAdminSlice(...a),
}));

// Export config
export { auth, db, storage, getOldDb, getOldStorage, isMigrationEnabled } from './config';

// Export auth services and types
export {
  signUp,
  signIn,
  logout,
  sendResetPasswordEmail,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  subscribeToAuthStateChanges,
  getCurrentUser,
  getIdToken,
  toAuthUser,
  handleAuthError,
  ensureUserDocumentExists,
  // Email link (passwordless) auth
  sendEmailSignInLink,
  isEmailSignInLink,
  completeEmailSignIn,
  completeEmailSignInWithUserSetup,
  getEmailLinkActionCodeSettings,
  deleteUserAccount,
  type AuthUser,
  type AuthResult,
  type EnsureUserResult,
  type EmailLinkConfig,
} from './auth';

// Export migration services
export {
  signInWithMigration,
  migrateUser,
  userExistsInNewProject,
  userExistsInOldProject,
  verifyOldProjectCredentials,
  signUpWithUserCreation,
  type MigrationResult,
  type OldCredentialsResult,
} from './migration';

// Export data migration services
export {
  migrateUserData,
  migrateTeamWithSubcollections,
  teamExistsInNewProject,
  getOldUserDocument,
  createMigratedUserDocument,
  markUserAsMigrated,
  checkNeedsMigration,
  checkAndMigrateOnAppLoad,
  reMigrateUserData,
  getOldUserUidByEmail,
  type DataMigrationResult,
  type ReMigrationProgress,
  type ReMigrationProgressCallback,
} from './dataMigration';

// Export auth hooks
export {
  useAuthState,
  useAuth,
  useMigrationAuth,
} from './hooks';

// Export Firestore services
export {
  // User operations
  getUserByUid,
  getUserByEmail,
  userDocumentExists,
  setUserDoc,
  subscribeToUser,
  uploadProfilePhoto,
  deleteProfilePhoto,
  updateUserOnboardingStatus,
  getUserOnboardingStatus,
  type OnboardingStatus,
  // New user/team creation
  createNewUserWithTeam,
  createDefaultTeam,
  linkPendingCoachInvites,
  getTeamsForUser,
  type CreateUserResult,
  // Team operations
  getTeamByRef,
  getTeamById,
  subscribeToTeam,
  updateTeam,
  uploadTeamLogo,
  deleteTeamLogo,
  uploadTeamFont,
  deleteTeamFont,
  deleteTeam,
  // Plan operations
  getPlans,
  getPlanById,
  subscribeToPlans,
  createPlan,
  updatePlan,
  deletePlan,
  enablePlanSharing,
  disablePlanSharing,
  getSharedPlanByToken,
  // Tag operations
  getTags,
  subscribeToTags,
  createTag,
  updateTag,
  deleteTag,
  // Coach operations
  getCoaches,
  subscribeToCoaches,
  addCoach,
  updateCoach,
  removeCoach,
  // Period operations
  getPeriods,
  subscribeToPeriods,
  createPeriod,
  updatePeriod,
  deletePeriod,
  // Template operations
  getTemplates,
  subscribeToTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  // File operations
  subscribeToFiles,
  getFiles,
  uploadFile,
  updateFile,
  deleteFile,
  getStorageUsage,
  // Folder operations
  subscribeToFolders,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  // File version operations
  getFileVersions,
  uploadFileVersion,
  restoreFileVersion,
  deleteFileVersion,
  // File share operations
  getFileShares,
  createFileShare,
  updateFileShare,
  deleteFileShare,
  incrementShareAccess,
  getShareById,
  // Announcement operations
  subscribeToAnnouncements,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementRead,
} from './firestore';

// Export social auth services
export {
  signInWithAppleCredential,
  signInWithGoogleCredential,
  getAppleProvider,
  getGoogleProvider,
} from './socialAuth';

// Export notification services
export {
  requestNotificationPermissions,
  getExpoPushToken,
  getFCMToken,
  updateUserPushToken,
  updateNotificationPreferences,
  sendPushNotification,
  getTeamMembers,
  sendAnnouncementNotifications,
  registerForPushNotifications,
  onForegroundMessage,
  initializeMessaging,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  type TeamMember,
} from './notifications';

// Export admin utilities
export {
  ADMIN_EMAIL,
  isAdmin,
  isCurrentUserAdmin,
} from './admin';

// Export user switching services
export {
  fetchAllUsers,
  searchUsers,
  getUserWithTeam,
  checkUserMigrationStatus,
  getUnmigratedOldProjectUsers,
  triggerMigrationForUser,
  sendPasswordResetToUser,
  fetchOldProjectUsers,
  searchOldProjectUsers,
  type UserWithTeam,
  type FetchUsersResult,
  type OldProjectUserInfo,
  type TriggerMigrationResult,
  type OldProjectUser,
} from './userSwitching';

// Export email services
export {
  sendEmail,
  sendPlanShareEmail,
  sendAnnouncementEmail,
  sendWelcomeEmail,
  sendFileShareEmail,
  type EmailMessage,
  type EmailAttachment,
  type EmailDocument,
  type SendEmailOptions,
  type PlanShareEmailParams,
  type AnnouncementEmailParams,
  type WelcomeEmailParams,
  type FileShareEmailParams,
} from './email';

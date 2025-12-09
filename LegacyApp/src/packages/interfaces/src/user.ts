import { DocumentReference, Timestamp } from "firebase/firestore";

export interface User {
	fname: string;
	lname: string;
	isAdmin: string;
	tpNews: number;
	entitlement: number;
	stripeEntitlement: number;
	created: number;
	modified: number;
	created_t?: Timestamp;
	modified_t?: Timestamp;
	uid: string;
	email: string;
	path: string;
	teamRef: DocumentReference;
	ref: DocumentReference;
	// Migration flags
	dataMigrated?: boolean;
	migratedAt?: number;
	// Notification preferences
	pushEnabled?: boolean;
	emailEnabled?: boolean;
	expoPushToken?: string;
	fcmToken?: string;
	// Profile photo
	photoUrl?: string;
	// User onboarding
	interests?: string[]; // Features the user is interested in (collected during onboarding)
	onboardingCompleted?: boolean; // Whether the user has completed the onboarding flow
	welcomeTourCompleted?: boolean; // Whether the user has completed the welcome tour
	welcomeTourCompletedAt?: number; // Timestamp when welcome tour was completed
	guidedTourCompleted?: boolean; // Whether the user has completed the guided tour
	guidedTourCompletedAt?: number; // Timestamp when guided tour was completed
	onboardingSkipped?: boolean; // Whether the user skipped the onboarding
	onboardingSkippedAt?: number; // Timestamp when onboarding was skipped
}

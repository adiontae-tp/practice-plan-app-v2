/**
 * Firebase Admin SDK initialization for server-side operations
 * Used for verifying ID tokens and creating custom tokens
 */
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin needs a service account for some operations
// For Vercel deployment, use GOOGLE_APPLICATION_CREDENTIALS or individual env vars
const getServiceAccount = (): ServiceAccount | undefined => {
  // Check for base64-encoded service account JSON (for Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
      return JSON.parse(decoded) as ServiceAccount;
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', e);
    }
  }

  // Check for individual credentials (alternative approach)
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private key might have escaped newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // No service account available - some features won't work
  return undefined;
};

// Initialize Firebase Admin (singleton pattern)
function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = getServiceAccount();

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  // Initialize without service account (limited functionality)
  // This allows basic token verification on Google Cloud Platform
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

// Lazy initialization
let adminApp: ReturnType<typeof getFirebaseAdmin> | null = null;

export function getAdminAuth() {
  if (!adminApp) {
    adminApp = getFirebaseAdmin();
  }
  return getAuth(adminApp);
}

/**
 * Verify a Firebase ID token
 */
export async function verifyIdToken(idToken: string) {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return { success: true, uid: decodedToken.uid, email: decodedToken.email };
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Create a custom token for a user
 * This can be used to sign in on the client side
 */
export async function createCustomToken(uid: string) {
  try {
    const auth = getAdminAuth();
    const customToken = await auth.createCustomToken(uid);
    return { success: true, token: customToken };
  } catch (error: any) {
    console.error('Custom token creation failed:', error.message);
    return { success: false, error: error.message };
  }
}

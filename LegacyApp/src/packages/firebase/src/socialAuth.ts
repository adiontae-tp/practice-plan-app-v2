/**
 * Social Authentication (Apple & Google Sign-In)
 *
 * Platform-specific implementations:
 * - Mobile (Expo): Uses expo-apple-authentication and expo-auth-session
 * - Web: Uses Firebase popup/redirect methods
 */

import {
  signInWithCredential,
  OAuthProvider,
  GoogleAuthProvider,
  AuthCredential,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';
import { toAuthUser, handleAuthError, type AuthUser, type AuthResult } from './auth';

/**
 * Sign in with Apple credential (from expo-apple-authentication)
 * @param identityToken - The identity token from Apple
 * @param nonce - The nonce used during Apple authentication
 */
export const signInWithAppleCredential = async (
  identityToken: string,
  nonce?: string
): Promise<AuthResult> => {
  try {
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: identityToken,
      rawNonce: nonce,
    });

    const userCredential = await signInWithCredential(auth, credential);

    return {
      success: true,
      user: toAuthUser(userCredential.user),
    };
  } catch (error: any) {
    console.error('[SocialAuth] Apple sign-in failed:', error);
    return {
      success: false,
      error: handleAuthError(error),
    };
  }
};

/**
 * Sign in with Google credential (from expo-auth-session or web)
 * @param idToken - The ID token from Google
 * @param accessToken - Optional access token from Google
 */
export const signInWithGoogleCredential = async (
  idToken: string,
  accessToken?: string
): Promise<AuthResult> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const userCredential = await signInWithCredential(auth, credential);

    return {
      success: true,
      user: toAuthUser(userCredential.user),
    };
  } catch (error: any) {
    console.error('[SocialAuth] Google sign-in failed:', error);
    return {
      success: false,
      error: handleAuthError(error),
    };
  }
};

/**
 * Get Apple OAuth provider for web popup/redirect
 */
export const getAppleProvider = () => {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return provider;
};

/**
 * Get Google OAuth provider for web popup/redirect
 */
export const getGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  return provider;
};

// Re-export for convenience
export { OAuthProvider, GoogleAuthProvider };

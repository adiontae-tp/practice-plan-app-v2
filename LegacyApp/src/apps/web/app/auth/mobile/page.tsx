'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@ppa/firebase';

/**
 * Mobile Auth Handler Component
 */
function MobileAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const redirect = searchParams.get('redirect') || '/subscription';

      if (!token) {
        setStatus('error');
        setErrorMessage('No authentication token provided');
        // Redirect to login after a delay
        setTimeout(() => {
          router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
        }, 2000);
        return;
      }

      try {
        // Sign in with the custom token
        await signInWithCustomToken(auth, token);
        setStatus('success');

        // Redirect to destination
        setTimeout(() => {
          router.replace(redirect);
        }, 500);
      } catch (error: any) {
        console.error('Mobile auth failed:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Authentication failed');

        // Redirect to login after a delay
        setTimeout(() => {
          router.replace(`/login?redirect=${encodeURIComponent(redirect)}&error=auth_failed`);
        }, 2000);
      }
    };

    handleAuth();
  }, [searchParams, router]);

  return (
    <div className="text-center p-8 max-w-md">
      {status === 'loading' && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#356793] mx-auto mb-4" />
          <p className="text-gray-600">Signing you in...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <p className="text-gray-600">Signed in successfully!</p>
          <p className="text-gray-400 text-sm mt-2">Redirecting...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="text-red-500 text-5xl mb-4">✕</div>
          <p className="text-gray-600 mb-2">Authentication failed</p>
          {errorMessage && (
            <p className="text-gray-400 text-sm">{errorMessage}</p>
          )}
          <p className="text-gray-400 text-sm mt-4">Redirecting to login...</p>
        </>
      )}
    </div>
  );
}

/**
 * Mobile Auth Handler Page
 *
 * This page handles authentication when users come from the mobile app.
 * It receives a custom token and uses it to sign in.
 */
export default function MobileAuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <Suspense
        fallback={
          <div className="text-center p-8 max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#356793] mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        }
      >
        <MobileAuthHandler />
      </Suspense>
    </div>
  );
}

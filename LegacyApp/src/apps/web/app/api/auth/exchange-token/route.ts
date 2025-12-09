import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, createCustomToken } from '@/lib/firebase-admin';

/**
 * POST /api/auth/exchange-token
 *
 * Exchanges a Firebase ID token (from mobile) for a custom token
 * that can be used to sign in on the web.
 *
 * Request body: { idToken: string }
 * Response: { customToken: string } or { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the ID token
    const verifyResult = await verifyIdToken(idToken);
    if (!verifyResult.success || !verifyResult.uid) {
      return NextResponse.json(
        { error: verifyResult.error || 'Invalid token' },
        { status: 401 }
      );
    }

    // Create a custom token for this user
    const tokenResult = await createCustomToken(verifyResult.uid);
    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json(
        { error: tokenResult.error || 'Failed to create custom token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ customToken: tokenResult.token });
  } catch (error: any) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/exchange-token
 *
 * Alternative endpoint that accepts token as query param and redirects.
 * Used when mobile opens a URL directly with the token.
 *
 * Query params:
 * - token: Firebase ID token
 * - redirect: URL to redirect to after auth (default: /subscription)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idToken = searchParams.get('token');
  const redirectTo = searchParams.get('redirect') || '/subscription';

  if (!idToken) {
    // No token provided, redirect to login
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('redirect', redirectTo);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the ID token
  const verifyResult = await verifyIdToken(idToken);
  if (!verifyResult.success || !verifyResult.uid) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('redirect', redirectTo);
    loginUrl.searchParams.set('error', 'auth_expired');
    return NextResponse.redirect(loginUrl);
  }

  // Create a custom token
  const tokenResult = await createCustomToken(verifyResult.uid);
  if (!tokenResult.success || !tokenResult.token) {
    // Failed to create token, redirect to login
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('redirect', redirectTo);
    loginUrl.searchParams.set('error', 'token_error');
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to the auth handler page with the custom token
  const authUrl = new URL('/auth/mobile', request.nextUrl.origin);
  authUrl.searchParams.set('token', tokenResult.token);
  authUrl.searchParams.set('redirect', redirectTo);
  return NextResponse.redirect(authUrl);
}

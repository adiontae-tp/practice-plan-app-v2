'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { sendPasswordReset, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const validateForm = () => {
    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;

    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
    } catch {
      // Error is handled by useAuth hook and available in `error`
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-500 mt-2">
            We&apos;ve sent password reset instructions to
          </p>
          <p className="font-medium text-gray-900 mt-1">{email}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setIsSuccess(false)}
              className="text-[#356793] font-medium hover:underline"
            >
              try another email address
            </button>
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#356793] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-[#356793]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-[#356793]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
        <p className="text-sm text-gray-500 mt-2">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {/* Error Banner */}
      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error || formError}</p>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormError('');
            }}
            placeholder="coach@example.com"
            className={`h-11 ${formError ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-[#356793] hover:bg-[#2a5275] font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send reset instructions'}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

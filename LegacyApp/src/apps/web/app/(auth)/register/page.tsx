'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Eye, EyeOff, Check } from 'lucide-react';

const SPORTS = [
  'Basketball',
  'Football',
  'Soccer',
  'Baseball',
  'Volleyball',
  'Hockey',
  'Lacrosse',
  'Tennis',
  'Golf',
  'Swimming',
  'Track & Field',
  'Wrestling',
  'Softball',
  'Other',
];

interface FormErrors {
  fname?: string;
  lname?: string;
  teamName?: string;
  sport?: string;
  email?: string;
  password?: string;
}

const benefits = [
  'Unlimited practice plans',
  '14-day free trial of Coach features',
  'No credit card required',
];

export default function RegisterPage() {
  const { signUp, signInWithGoogle, signInWithApple, isLoading, error, clearError } = useAuth();
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!fname.trim()) {
      errors.fname = 'First name is required';
    }

    if (!lname.trim()) {
      errors.lname = 'Last name is required';
    }

    if (!teamName.trim()) {
      errors.teamName = 'Team name is required';
    }

    if (!sport) {
      errors.sport = 'Please select a sport';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;

    await signUp(email, password, fname.trim(), lname.trim(), teamName.trim(), sport);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-500 mt-2">
          Start planning better practices in minutes
        </p>
      </div>

      {/* Benefits pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {benefits.map((benefit) => (
          <span
            key={benefit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#356793] bg-[#356793]/10 px-2.5 py-1 rounded-full"
          >
            <Check className="w-3 h-3" />
            {benefit}
          </span>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Social Sign-Up Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 flex items-center justify-center gap-3 font-medium"
          onClick={signInWithGoogle}
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 flex items-center justify-center gap-3 font-medium bg-black text-white hover:bg-gray-800 hover:text-white border-black"
          onClick={signInWithApple}
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Sign up with Apple
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <Input
              type="text"
              value={fname}
              onChange={(e) => {
                setFname(e.target.value);
                if (formErrors.fname) setFormErrors((prev) => ({ ...prev, fname: undefined }));
              }}
              placeholder="John"
              className={`h-11 ${formErrors.fname ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
            />
            {formErrors.fname && (
              <p className="text-xs text-red-600">{formErrors.fname}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <Input
              type="text"
              value={lname}
              onChange={(e) => {
                setLname(e.target.value);
                if (formErrors.lname) setFormErrors((prev) => ({ ...prev, lname: undefined }));
              }}
              placeholder="Doe"
              className={`h-11 ${formErrors.lname ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
            />
            {formErrors.lname && (
              <p className="text-xs text-red-600">{formErrors.lname}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Team Name</label>
          <Input
            type="text"
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value);
              if (formErrors.teamName) setFormErrors((prev) => ({ ...prev, teamName: undefined }));
            }}
            placeholder="Warriors Basketball"
            className={`h-11 ${formErrors.teamName ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
          />
          {formErrors.teamName && (
            <p className="text-xs text-red-600">{formErrors.teamName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sport</label>
          <select
            value={sport}
            onChange={(e) => {
              setSport(e.target.value);
              if (formErrors.sport) setFormErrors((prev) => ({ ...prev, sport: undefined }));
            }}
            className={`flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              formErrors.sport
                ? 'border-red-300 focus-visible:ring-red-200'
                : 'border-gray-300 focus-visible:ring-[#356793]'
            }`}
          >
            <option value="">Select a sport</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {formErrors.sport && (
            <p className="text-xs text-red-600">{formErrors.sport}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="coach@example.com"
            className={`h-11 ${formErrors.email ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
          />
          {formErrors.email && (
            <p className="text-xs text-red-600">{formErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Create a password (6+ characters)"
              className={`h-11 pr-10 ${formErrors.password ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-xs text-red-600">{formErrors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-[#356793] hover:bg-[#2a5275] font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </div>
  );
}

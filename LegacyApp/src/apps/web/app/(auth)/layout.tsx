'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Calendar, FileText, Users, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Visual Practice Planning',
    description: 'Drag and drop to build perfect practices',
  },
  {
    icon: FileText,
    title: 'Professional PDFs',
    description: 'Export branded practice plans instantly',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share with your coaching staff',
  },
  {
    icon: BarChart3,
    title: 'Practice Analytics',
    description: 'Track how you spend practice time',
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLogin = pathname === '/login';
  const isRegister = pathname === '/register';
  const isForgotPassword = pathname === '/forgot-password';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Marketing Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="PracticePlan"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold text-gray-900">PracticePlan</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/features"
                  className="text-sm font-medium text-gray-600 hover:text-[#356793] transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/for-coaches"
                  className="text-sm font-medium text-gray-600 hover:text-[#356793] transition-colors"
                >
                  For Coaches
                </Link>
                <Link
                  href="/directors"
                  className="text-sm font-medium text-gray-600 hover:text-[#356793] transition-colors"
                >
                  For Directors
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-gray-600 hover:text-[#356793] transition-colors"
                >
                  Pricing
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {isLogin ? (
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#356793] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#2a5276] transition-colors"
                >
                  Sign Up
                </Link>
              ) : isRegister ? (
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#356793] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#2a5276] transition-colors"
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-[#356793] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#356793] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#2a5276] transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left side - Marketing content */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#356793] to-[#2a5276] p-12 flex-col justify-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 border border-white/30 rounded-full" />
            <div className="absolute bottom-20 right-20 w-96 h-96 border border-white/30 rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white/30 rounded-full" />
          </div>

          <div className="relative z-10">
            {/* Main headline */}
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                {isRegister
                  ? 'Start planning better practices today'
                  : isLogin
                  ? 'Welcome back, Coach'
                  : 'Reset your password'}
              </h1>
              <p className="mt-4 text-lg text-blue-100">
                {isRegister
                  ? 'Join thousands of coaches who save hours every week with professional practice planning tools.'
                  : isLogin
                  ? 'Sign in to access your practice plans, templates, and team resources.'
                  : 'We\'ll send you instructions to get back into your account.'}
              </p>
            </div>

            {/* Features list */}
            {(isRegister || isLogin) && (
              <div className="mt-12 space-y-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-blue-100">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex-1 flex flex-col min-h-full bg-gray-50">
          {/* Form container */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-md">
              {/* Desktop navigation link */}
              <div className="hidden lg:block text-right mb-4 text-sm text-gray-600">
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-semibold text-[#356793] hover:underline">
                      Sign up free
                    </Link>
                  </>
                ) : isRegister ? (
                  <>
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-[#356793] hover:underline">
                      Sign in
                    </Link>
                  </>
                ) : null}
              </div>

              {/* Form card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                {children}
              </div>

              {/* Footer links */}
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-[#356793] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#356793] hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="py-4 text-center text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} PracticePlan. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

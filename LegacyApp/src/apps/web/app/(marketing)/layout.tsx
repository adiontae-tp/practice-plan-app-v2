'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
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
                Try Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="PracticePlan"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-lg font-bold text-gray-900">PracticePlan</span>
              </Link>
              <p className="text-sm text-gray-500 max-w-xs">
                The smart way to plan practices and develop athletes.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/features" className="text-sm text-gray-500 hover:text-[#356793]">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-gray-500 hover:text-[#356793]">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/for-coaches" className="text-sm text-gray-500 hover:text-[#356793]">
                    For Coaches
                  </Link>
                </li>
                <li>
                  <Link href="/directors" className="text-sm text-gray-500 hover:text-[#356793]">
                    For Directors
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-gray-500 hover:text-[#356793]">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-500 hover:text-[#356793]">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-gray-500 hover:text-[#356793]">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm text-gray-500 hover:text-[#356793]">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-500 hover:text-[#356793]">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-400 text-center">
              &copy; {new Date().getFullYear()} PracticePlan App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

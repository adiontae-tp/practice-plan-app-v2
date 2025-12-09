'use client';

import { useEffect } from 'react';
import { Mail } from 'lucide-react';
import { useAppStore } from '@ppa/store';

export default function SupportPage() {
  const { setBackDestination, clearBackNavigation } = useAppStore();

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  const handleEmailClick = () => {
    const email = 'support@teamparcee.com';
    const subject = encodeURIComponent('Support Request');
    window.location.href = `mailto:${email}?subject=${subject}`;
  };

  return (
    <div className="space-y-8 py-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#356793]/10 text-[#356793]">
            <Mail className="h-8 w-8" />
          </div>
        </div>
        
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">Support</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Need help? We&apos;re here for you.
        </p>

        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <p className="text-gray-700 mb-6">
            Please email us at:
          </p>
          
          <a
            href="mailto:support@teamparcee.com"
            onClick={handleEmailClick}
            className="inline-flex items-center gap-2 text-xl font-semibold text-[#356793] hover:text-[#2a5276] transition-colors"
          >
            <Mail className="h-5 w-5" />
            support@teamparcee.com
          </a>
          
          <p className="text-sm text-gray-500 mt-6">
            We typically respond within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}





'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X, Play } from 'lucide-react';
import { ContactCard, InfoBox } from '@/components/tp/help';
import { useAppStore } from '@ppa/store';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { startWelcomeTour, startGuidedTour } = useAppStore();

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleEmailClick = () => {
    // Create mailto link with pre-filled subject
    const email = 'support@practiceplanner.app';
    const subject = encodeURIComponent('Practice Plan App - Support Request');
    const body = encodeURIComponent(`Hi Team,

I need help with:

[Please describe your issue or question here]

---
App Version: 1.0.0
Platform: Web`);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSuccessMessage('Opening email client...');
  };

  return (
    <>
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Help & Support</h1>
          <p className="text-gray-600 mt-2">
            We&apos;re here to help you get the most out of Practice Plan App
          </p>
        </div>

        {/* Replay Tour Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Take a Tour</h2>
            <p className="text-sm text-gray-600 mb-4">
              Need a refresher? Replay the onboarding tour to learn about key features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => startWelcomeTour()}
                variant="outline"
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Welcome Tour
              </Button>
              <Button
                onClick={() => startGuidedTour()}
                variant="outline"
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Guided Tour
              </Button>
            </div>
          </div>
        </div>

        <ContactCard onEmailClick={handleEmailClick} />

        <InfoBox
          title="Helpful Tip"
          message="When reporting an issue, please include details about what you were trying to do and any error messages you saw. Screenshots are also helpful!"
        />

        {/* FAQ Section */}
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <FaqItem
              question="How do I add a new practice plan?"
              answer="Go to the Calendar page and click the 'New Plan' button, or click on any date to create a plan for that day."
            />
            <FaqItem
              question="Can I share plans with my assistant coaches?"
              answer="Yes! Invite coaches from the Coaches page. They'll receive an email invitation to join your team."
            />
            <FaqItem
              question="How do I upgrade my subscription?"
              answer="Visit the Subscription page to view available plans and upgrade options."
            />
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center text-sm text-gray-400">
          <p>Practice Plan App v1.0.0</p>
          <p>© 2024 Team Parcee. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">{question}</h4>
      <p className="text-sm text-gray-600">{answer}</p>
    </div>
  );
}

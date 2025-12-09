'use client';

import { Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactCardProps {
  onEmailClick: () => void;
}

export function ContactCard({ onEmailClick }: ContactCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#356793] flex items-center justify-center">
        <Mail className="w-8 h-8 text-white" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h2>
      <p className="text-gray-600 mb-6">
        Have questions, feedback, or need help? Our team is here to assist you.
      </p>

      <Button
        onClick={onEmailClick}
        className="w-full bg-[#356793] hover:bg-[#2a5275] mb-4"
      >
        <Mail className="w-4 h-4 mr-2" />
        Send Email
      </Button>

      <p className="text-sm text-gray-500">
        support@practiceplanner.app
      </p>
    </div>
  );
}

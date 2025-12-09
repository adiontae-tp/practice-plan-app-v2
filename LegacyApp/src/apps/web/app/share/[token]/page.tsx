'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Printer, Loader2, AlertCircle } from 'lucide-react';
import { getSharedPlanByToken } from '@ppa/firebase';
import { generatePlanHTML } from '@ppa/pdf';
import type { Plan, Team } from '@ppa/interfaces';

export default function SharedPlanPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    const fetchPlan = async () => {
      if (!token) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const result = await getSharedPlanByToken(token);

        if (!result) {
          setError('This practice plan is no longer available or the link has expired.');
          setLoading(false);
          return;
        }

        setPlan(result.plan);
        setTeam(result.team);

        const generatedHtml = generatePlanHTML(result.plan, {
          template: 'standard',
          teamName: result.team.name,
          teamSport: result.team.sport,
          logoUrl: result.team.logoUrl,
          primaryColor: result.team.primaryColor,
        });

        setHtml(generatedHtml);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shared plan:', err);
        setError('Failed to load practice plan. Please try again.');
        setLoading(false);
      }
    };

    fetchPlan();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#356793] mx-auto mb-4" />
          <p className="text-gray-600">Loading practice plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Plan Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="https://practiceplanapp.com"
            className="inline-block px-6 py-2 bg-[#356793] text-white rounded-lg hover:bg-[#2a5275] transition-colors"
          >
            Go to Practice Plan App
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {team?.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={`${team.name} logo`}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: team?.primaryColor || '#356793' }}
              >
                <span className="text-white text-sm font-bold">
                  {team?.name?.substring(0, 2).toUpperCase() || 'PP'}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{team?.name}</p>
              <p className="text-xs text-gray-500">Shared Practice Plan</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: team?.primaryColor || '#356793' }}
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 print:p-0 print:max-w-none">
        <div
          className="bg-white shadow-lg print:shadow-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4 px-4 print:hidden">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Created with{' '}
            <a
              href="https://practiceplanapp.com"
              className="text-[#356793] hover:underline"
            >
              Practice Plan App
            </a>
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

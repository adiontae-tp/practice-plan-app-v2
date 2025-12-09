'use client';

import { MockPlan } from '@ppa/mock';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanCardProps {
  plan: MockPlan;
  onSelect: (plan: MockPlan) => void;
}

export function PlanCard({ plan, onSelect }: PlanCardProps) {
  return (
    <div
      className={`relative bg-white rounded-xl border-2 p-6 ${
        plan.isPopular
          ? 'border-[#356793] shadow-lg'
          : plan.isCurrent
          ? 'border-green-500'
          : 'border-gray-200'
      }`}
    >
      {/* Popular badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#356793] text-white">
            Most Popular
          </span>
        </div>
      )}

      {/* Current badge */}
      {plan.isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-6 pt-2">
        <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">
            ${plan.price}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-500 ml-1">/{plan.interval}</span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onSelect(plan)}
        disabled={plan.isCurrent}
        className={`w-full ${
          plan.isCurrent
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed hover:bg-gray-100'
            : plan.isPopular
            ? 'bg-[#356793] hover:bg-[#2a5275]'
            : 'bg-gray-900 hover:bg-gray-800'
        }`}
      >
        {plan.isCurrent ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Upgrade'}
      </Button>
    </div>
  );
}

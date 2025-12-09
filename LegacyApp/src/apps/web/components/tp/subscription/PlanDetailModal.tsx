'use client';

import { MockPlan } from '@ppa/mock';
import { Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PlanDetailModalProps {
  open: boolean;
  plan: MockPlan | null;
  onClose: () => void;
  onSubscribe: (plan: MockPlan) => void;
}

export function PlanDetailModal({ open, plan, onClose, onSubscribe }: PlanDetailModalProps) {
  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{plan.name} Plan</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center mb-6 py-4 bg-gray-50 rounded-lg">
            <span className="text-4xl font-bold text-gray-900">
              ${plan.price}
            </span>
            {plan.price > 0 && (
              <span className="text-gray-500 ml-1">/{plan.interval}</span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Included Features</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.limitations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Limitations</h4>
                <ul className="space-y-2">
                  {plan.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubscribe(plan)}
            disabled={plan.isCurrent}
            className="bg-[#356793] hover:bg-[#2a5275]"
          >
            {plan.isCurrent
              ? 'Current Plan'
              : plan.price === 0
              ? 'Get Started Free'
              : `Subscribe for $${plan.price}/${plan.interval}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@ppa/store';
import { PlanEditor } from '@/components/tp/plan';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export default function EditPlanPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const plans = useAppStore((state) => state.plans);
  const isAppLoading = useAppStore((state) => state.isAppLoading);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find the plan
  const plan = plans.find((p) => p.id === id);

  if (!mounted || isAppLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="h-16 border-b bg-white flex items-center px-6 gap-4">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-48 h-6" />
        </div>
        <div className="flex-1 p-8 flex gap-8">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="w-80 h-full" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Plan Not Found</h2>
          <p className="text-gray-500 mt-2">
            The practice plan you are trying to edit does not exist or you don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return <PlanEditor plan={plan} />;
}

'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@ppa/store';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TPRichTextDisplay } from '@/components/tp';

export default function NotesPage() {
  const router = useRouter();
  
  // Access store directly similar to how mobile app does
  // The mobile app uses "viewingNotes" but that seems to be for a read-only modal
  // If this is a standalone notes page, we need to see where it gets data
  // In mobile app, notes-view.tsx gets `viewingNotes` from store.
  // `viewingNotes` has { notes: string; activityName: string; ... }
  // It seems mobile only has a "View" for notes, not a standalone "Notes" page in the tab bar?
  // Wait, the sidebar has "Notes" link? No, I don't recall seeing it in the sidebar I built.
  // Let's check the sidebar again.
  
  // Re-reading sidebar... NO "Notes" in sidebar.
  // Mobile app has `src/apps/mobile/app/(main)/notes-view.tsx` which is a modal route.
  // It is likely triggered from the Plan Detail view when clicking an activity.
  
  // However, the user asked me to build "Notes Feature" and "apps/web/app/notes/page.tsx".
  // If I am building a page to *edit* notes for a specific activity, I need context (activity ID).
  // Or maybe this is a general scratchpad?
  // Let's look at the mobile app structure again. 
  // `notes-view.tsx` is in `(main)`. It uses `viewingNotes` from store.
  
  // I will implement a page that handles the `viewingNotes` state from the store,
  // effectively mirroring the mobile app's behavior.
  // If `viewingNotes` is null, it redirects back.
  
  const viewingNotes = useAppStore((state) => state.viewingNotes);
  const clearViewingNotes = useAppStore((state) => state.clearViewingNotes);
  
  // We also need to be able to SAVE notes if we are editing.
  // Mobile `notes-view.tsx` seems read-only?
  // "Modal for viewing activity notes as HTML/formatted text." -> comments say viewing.
  // But the mobile app *must* have a way to edit notes.
  // In mobile `DrillItem.tsx` or `PlanDetail.tsx`?
  // The editing likely happens in the `PlanEditor` or `ActivityEditor`.
  // I just built `PlanEditor` for web. It has a `TPRichTextEditor`? No, it has tags & notes text.
  // Let's check `PlanEditor` again.
  
  // The `DraggablePeriod` component I built shows notes as text.
  // It doesn't have an edit button for the specific drill notes.
  // The mobile app allows editing notes inside the plan editor?
  // OR does it have a dedicated screen?
  
  // Let's assume this page is for VIEWING notes, like mobile.
  // But if I want "parity", I should probably allow editing if the context allows.
  
  // Let's build a page that mimics `notes-view.tsx` but for web.
  // It will consume `viewingNotes` from store.
  
  if (!viewingNotes) {
    // Redirect if no notes (client-side redirect)
    useEffect(() => {
      router.back();
    }, [router]);
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              clearViewingNotes();
              router.back();
            }}
            className="-ml-2 text-gray-500"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{viewingNotes.activityName}</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[200px]">
        <TPRichTextDisplay html={viewingNotes.notes} />
      </div>
    </div>
  );
}

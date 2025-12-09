'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plan, Period, Template, Activity } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { ChevronLeft, Save, Clock, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DraggablePeriod } from './DraggablePeriod';
import { PeriodLibrary } from './PeriodLibrary';
import { v4 as uuidv4 } from 'uuid';

interface PlanEditorProps {
  plan: Plan;
}

export function PlanEditor({ plan: initialPlan }: PlanEditorProps) {
  const router = useRouter();
  const {
    periods,
    templates,
    team,
    updatePlan,
  } = useAppStore();

  const [activities, setActivities] = useState<Activity[]>(initialPlan.activities || []);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActivities((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  };

  const handleAddPeriod = (period: Period) => {
    const newActivity: Activity = {
      id: uuidv4(),
      name: period.name,
      duration: period.duration,
      notes: period.notes,
      tags: [],
      startTime: 0,
      endTime: 0,
    };
    setActivities((prev) => [...prev, newActivity]);
    setHasChanges(true);
  };

  const handleAddTemplate = (template: Template) => {
    if (!template.activities) return;

    const newActivities: Activity[] = template.activities.map((activity) => ({
      id: uuidv4(),
      name: activity.name,
      duration: activity.duration,
      notes: activity.notes,
      tags: activity.tags,
      startTime: 0,
      endTime: 0,
    }));
    
    setActivities((prev) => [...prev, ...newActivities]);
    setHasChanges(true);
  };

  const handleRemoveActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!team?.id || !initialPlan.id) return;
    
    setIsSaving(true);
    try {
      // Recalculate start/end times for all activities based on plan start time
      let currentTime = initialPlan.startTime;
      const updatedActivities = activities.map(activity => {
        const start = currentTime;
        const end = start + activity.duration * 60 * 1000;
        currentTime = end;
        return {
          ...activity,
          startTime: start,
          endTime: end,
        };
      });

      // Update plan duration based on last activity end time or default
      const newEndTime = updatedActivities.length > 0 
        ? updatedActivities[updatedActivities.length - 1].endTime 
        : initialPlan.endTime;
        
      const newDuration = Math.round((newEndTime - initialPlan.startTime) / (60 * 1000));

      await updatePlan(team.id, initialPlan.id, {
        activities: updatedActivities,
        duration: newDuration,
        endTime: newEndTime,
      });
      
      setHasChanges(false);
      // Optional: show success toast
    } catch (error) {
      console.error('Failed to save plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate derived times for display
  const activityTimes = useMemo(() => {
    let currentTime = initialPlan.startTime;
    return activities.map(activity => {
      const start = currentTime;
      currentTime += activity.duration * 60 * 1000;
      return start;
    });
  }, [activities, initialPlan.startTime]);

  const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900 -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Edit Practice Plan</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {new Date(initialPlan.startTime).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(initialPlan.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                {totalDuration} min total
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-[#356793] hover:bg-[#2a5275]"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas / List */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activities.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {activities.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-white/50">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Start Planning</h3>
                    <p className="text-gray-500 mt-1 max-w-xs mx-auto">
                      Drag periods from the library on the right to build your practice plan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.map((activity, index) => (
                      <DraggablePeriod
                        key={activity.id}
                        activity={activity}
                        index={index}
                        startTime={activityTimes[index]}
                        onRemove={handleRemoveActivity}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DndContext>
            
            {/* Summary Footer */}
            {activities.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6 text-center text-gray-500 text-sm">
                End of Practice · {new Date(initialPlan.startTime + totalDuration * 60 * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Library */}
        <PeriodLibrary
          periods={periods}
          templates={templates}
          onAddPeriod={handleAddPeriod}
          onAddTemplate={handleAddTemplate}
        />
      </div>
    </div>
  );
}

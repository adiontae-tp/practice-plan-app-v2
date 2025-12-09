'use client';

import { useMemo, useState } from 'react';
import { Period, Template } from '@ppa/interfaces';
import { Search, Plus, FileStack, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PeriodLibraryProps {
  periods: Period[];
  templates: Template[];
  onAddPeriod: (period: Period) => void;
  onAddTemplate: (template: Template) => void;
}

export function PeriodLibrary({
  periods,
  templates,
  onAddPeriod,
  onAddTemplate,
}: PeriodLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeriods = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return periods.filter((p) => p.name.toLowerCase().includes(query));
  }, [periods, searchQuery]);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return templates.filter((t) => t.name.toLowerCase().includes(query));
  }, [templates, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 w-[320px]">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Library</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search periods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      <Tabs defaultValue="periods" className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="periods">Periods</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="periods" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {filteredPeriods.map((period) => (
                <div
                  key={period.id}
                  className="p-3 rounded-lg border border-gray-200 bg-white hover:border-[#356793] hover:shadow-sm transition-all group cursor-pointer"
                  onClick={() => onAddPeriod(period)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {period.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3 mr-1" />
                          {period.duration}m
                        </span>
                      </div>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-[#356793] opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredPeriods.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No periods found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 rounded-lg border border-gray-200 bg-white hover:border-[#356793] hover:shadow-sm transition-all group cursor-pointer"
                  onClick={() => onAddTemplate(template)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {template.name}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <FileStack className="w-3 h-3" />
                        <span>{template.activities?.length || 0} periods</span>
                      </div>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-[#356793] opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No templates found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

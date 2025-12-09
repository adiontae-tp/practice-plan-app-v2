import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import {
  FileText,
  FileStack,
  FileSpreadsheet,
  Download,
  Share2,
  Printer,
  CheckCircle2,
} from 'lucide-react-native';
import { useAppStore } from '@ppa/store';
import { generatePlanHTML, PDF_TEMPLATES, type PDFTemplate } from '@ppa/pdf';
import { COLORS } from '@ppa/ui/branding';
import { TPActionSheet } from './TPActionSheet';
import { TPButton } from './TPButton';

// Dynamic imports for expo-print and expo-sharing
let Print: any = null;
let Sharing: any = null;

// Lazy load expo modules
async function loadExpoModules() {
  if (!Print) {
    Print = await import('expo-print');
  }
  if (!Sharing) {
    Sharing = await import('expo-sharing');
  }
}

const TEMPLATE_ICONS: Record<PDFTemplate, React.ReactNode> = {
  standard: <FileText size={28} color={COLORS.textSecondary} />,
  compact: <FileStack size={28} color={COLORS.textSecondary} />,
  detailed: <FileSpreadsheet size={28} color={COLORS.textSecondary} />,
};

const TEMPLATE_ICONS_SELECTED: Record<PDFTemplate, React.ReactNode> = {
  standard: <FileText size={28} color={COLORS.primary} />,
  compact: <FileStack size={28} color={COLORS.primary} />,
  detailed: <FileSpreadsheet size={28} color={COLORS.primary} />,
};

export interface TPPdfTemplateSheetProps {
  teamName?: string;
  teamSport?: string;
  headCoachName?: string;
}

export const TPPdfTemplateSheet = ({
  teamName,
  teamSport,
  headCoachName,
}: TPPdfTemplateSheetProps) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const pdfShowTemplateModal = useAppStore((s) => s.pdfShowTemplateModal);
  const pdfSelectedPlan = useAppStore((s) => s.pdfSelectedPlan);
  const pdfSelectedTemplate = useAppStore((s) => s.pdfSelectedTemplate);
  const pdfIsGenerating = useAppStore((s) => s.pdfIsGenerating);
  const setPdfSelectedTemplate = useAppStore((s) => s.setPdfSelectedTemplate);
  const setPdfIsGenerating = useAppStore((s) => s.setPdfIsGenerating);
  const closePdfTemplateModal = useAppStore((s) => s.closePdfTemplateModal);

  const handleGenerate = useCallback(
    async (action: 'print' | 'share') => {
      if (!pdfSelectedPlan) return;

      setPdfIsGenerating(true);

      try {
        await loadExpoModules();

        const html = generatePlanHTML(pdfSelectedPlan, {
          template: pdfSelectedTemplate,
          teamName,
          teamSport,
          headCoachName,
        });

        if (action === 'print') {
          // Open print dialog
          await Print.printAsync({ html });
          setPdfIsGenerating(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            closePdfTemplateModal();
          }, 1500);
        } else {
          // Generate PDF file and share
          const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
          });

          if (await Sharing.isAvailableAsync()) {
            const date = new Date(pdfSelectedPlan.startTime);
            const dateStr = date.toISOString().split('T')[0];

            await Sharing.shareAsync(uri, {
              mimeType: 'application/pdf',
              dialogTitle: `Practice Plan - ${dateStr}`,
              UTI: 'com.adobe.pdf',
            });
          }

          setPdfIsGenerating(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            closePdfTemplateModal();
          }, 1500);
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        setPdfIsGenerating(false);
      }
    },
    [
      pdfSelectedPlan,
      pdfSelectedTemplate,
      teamName,
      teamSport,
      headCoachName,
      setPdfIsGenerating,
      closePdfTemplateModal,
    ]
  );

  const handleClose = useCallback(() => {
    if (!pdfIsGenerating) {
      closePdfTemplateModal();
    }
  }, [pdfIsGenerating, closePdfTemplateModal]);

  if (!pdfSelectedPlan) return null;

  return (
    <TPActionSheet
      isOpen={pdfShowTemplateModal}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      detents={['medium']}
      preventDismiss={pdfIsGenerating}
    >
      {/* Header */}
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-900">Export as PDF</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Choose a template style for your practice plan
        </Text>
      </View>

      {/* Success State */}
      {showSuccess ? (
        <View className="items-center justify-center py-8">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <CheckCircle2 size={32} color="#16a34a" />
          </View>
          <Text className="text-lg font-medium text-gray-900">PDF ready!</Text>
        </View>
      ) : (
        <>
          {/* Template Selection */}
          <View className="flex-row gap-3 mb-6">
            {PDF_TEMPLATES.map((template) => {
              const isSelected = pdfSelectedTemplate === template.id;
              return (
                <Pressable
                  key={template.id}
                  onPress={() => setPdfSelectedTemplate(template.id)}
                  disabled={pdfIsGenerating}
                  className={`flex-1 items-center p-3 rounded-xl border-2 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  } ${pdfIsGenerating ? 'opacity-50' : ''}`}
                >
                  <View className="mb-2">
                    {isSelected
                      ? TEMPLATE_ICONS_SELECTED[template.id]
                      : TEMPLATE_ICONS[template.id]}
                  </View>
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? 'text-primary-500' : 'text-gray-700'
                    }`}
                  >
                    {template.name}
                  </Text>
                  <Text
                    className="text-xs text-gray-500 text-center mt-1"
                    numberOfLines={2}
                  >
                    {template.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TPButton
                label={pdfIsGenerating ? 'Generating...' : 'Print'}
                variant="outline"
                onPress={() => handleGenerate('print')}
                disabled={pdfIsGenerating}
                leftIcon={
                  pdfIsGenerating ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Printer size={18} color={COLORS.primary} />
                  )
                }
              />
            </View>
            <View className="flex-1">
              <TPButton
                label={pdfIsGenerating ? 'Generating...' : 'Share'}
                variant="filled"
                onPress={() => handleGenerate('share')}
                disabled={pdfIsGenerating}
                leftIcon={
                  pdfIsGenerating ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Share2 size={18} color={COLORS.white} />
                  )
                }
              />
            </View>
          </View>
        </>
      )}
    </TPActionSheet>
  );
};

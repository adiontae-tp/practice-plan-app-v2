/**
 * Plan PDF View Screen
 * Route: /(main)/plan/[id]/pdf.tsx
 * PDF template selection and generation with share link support
 */
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  FileText,
  FileStack,
  FileSpreadsheet,
  Printer,
  Share2,
  Lock,
  X,
  CheckCircle2,
  Link2,
  Mail,
  ExternalLink,
} from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import { generatePlanHTML, PDF_TEMPLATES, type PDFTemplate } from '@ppa/pdf';
import { enablePlanSharing } from '@ppa/firebase';
import { TPButton, TPUpgradeBanner } from '@/components/tp';
import { useSubscription } from '@/hooks/useSubscription';

let Print: any = null;
let Sharing: any = null;

async function loadExpoModules() {
  if (!Print) {
    Print = await import('expo-print');
  }
  if (!Sharing) {
    Sharing = await import('expo-sharing');
  }
}

const TEMPLATE_ICONS: Record<PDFTemplate, React.ReactNode> = {
  standard: <FileText size={32} color={COLORS.textSecondary} />,
  compact: <FileStack size={32} color={COLORS.textSecondary} />,
  detailed: <FileSpreadsheet size={32} color={COLORS.textSecondary} />,
};

const TEMPLATE_ICONS_SELECTED: Record<PDFTemplate, React.ReactNode> = {
  standard: <FileText size={32} color={COLORS.primary} />,
  compact: <FileStack size={32} color={COLORS.primary} />,
  detailed: <FileSpreadsheet size={32} color={COLORS.primary} />,
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const WEB_BASE_URL = 'https://app.practiceplanapp.com';

export default function PlanPdfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { checkFeature, features } = useSubscription();
  const canExportPDF = features.canExportPDF;

  const plans = useAppStore((state) => state.plans);
  const plansLoading = useAppStore((state) => state.plansLoading);
  const team = useAppStore((state) => state.team);
  const user = useAppStore((state) => state.user);

  const pdfSelectedTemplate = useAppStore((s) => s.pdfSelectedTemplate);
  const pdfIsGenerating = useAppStore((s) => s.pdfIsGenerating);
  const setPdfSelectedTemplate = useAppStore((s) => s.setPdfSelectedTemplate);
  const setPdfIsGenerating = useAppStore((s) => s.setPdfIsGenerating);

  const [showSuccess, setShowSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  const plan = useMemo(() => {
    return plans.find((p) => p.id === id) || null;
  }, [plans, id]);

  useEffect(() => {
    if (plan?.shareEnabled && plan?.shareToken) {
      setShareUrl(`${WEB_BASE_URL}/share/${plan.shareToken}`);
    }
  }, [plan]);

  const generateShareUrl = useCallback(async () => {
    if (!plan || !team?.id) return;

    setShareLoading(true);
    try {
      const token = await enablePlanSharing(team.id, plan.id);
      const url = `${WEB_BASE_URL}/share/${token}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setShareLoading(false);
    }
  }, [plan, team]);

  const copyShareUrl = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await Share.share({
        message: shareUrl,
        title: 'Practice Plan Link',
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }, [shareUrl]);

  const handleEmail = useCallback(async () => {
    if (!plan) return;

    const planDate = formatDate(plan.startTime);
    const subject = encodeURIComponent(`Practice Plan - ${planDate}`);
    let body = `Practice Plan for ${planDate}`;

    if (team?.name) {
      body += `\nTeam: ${team.name}`;
    }

    if (shareUrl) {
      body += `\n\nView online: ${shareUrl}`;
    } else {
      body += `\n\n(Generate a share link to include a viewable link in your email)`;
    }

    const mailtoUrl = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
    
    try {
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      console.error('Failed to open email:', error);
    }
  }, [plan, team, shareUrl]);

  const handleOpenShareUrl = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await Linking.openURL(shareUrl);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  }, [shareUrl]);

  const handleGenerate = useCallback(
    async (action: 'print' | 'share') => {
      if (!plan) return;

      if (!checkFeature('canExportPDF')) {
        return;
      }

      setPdfIsGenerating(true);

      try {
        await loadExpoModules();

        const html = generatePlanHTML(plan, {
          template: pdfSelectedTemplate,
          teamName: team?.name,
          teamSport: team?.sport,
          headCoachName: user ? `${user.fname} ${user.lname}`.trim() : undefined,
          logoUrl: team?.logoUrl,
          primaryColor: team?.primaryColor,
          shareUrl: shareUrl || undefined,
        });

        if (action === 'print') {
          await Print.printAsync({ html });
          setPdfIsGenerating(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            router.back();
          }, 1500);
        } else {
          const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
          });

          if (await Sharing.isAvailableAsync()) {
            const date = new Date(plan.startTime);
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
            router.back();
          }, 1500);
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        setPdfIsGenerating(false);
      }
    },
    [plan, pdfSelectedTemplate, team, user, shareUrl, checkFeature, setPdfIsGenerating, router]
  );

  if (plansLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center bg-[#e0e0e0]">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="mt-4 text-gray-600">Loading...</Text>
        </View>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-[#e0e0e0]">
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }}>
            <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-200">
              <Text className="text-xl font-semibold text-gray-900">Export PDF</Text>
              <Pressable onPress={() => router.back()}>
                <X size={24} color="#666666" />
              </Pressable>
            </View>
          </SafeAreaView>
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-lg text-gray-600">Practice not found</Text>
            <View className="mt-4">
              <TPButton label="Go Back" onPress={() => router.back()} />
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-[#e0e0e0]">
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
          <View className="px-5 py-4">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                <X size={24} color="#ffffff" />
              </Pressable>
              <Text className="text-xl font-semibold text-white">Export as PDF</Text>
              <View style={{ width: 28 }} />
            </View>
          </View>
        </SafeAreaView>

        {!canExportPDF && (
          <TPUpgradeBanner
            feature="canExportPDF"
            message="Upgrade to export practice plans as PDF"
          />
        )}

        {showSuccess ? (
          <View className="flex-1 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
              <CheckCircle2 size={40} color="#16a34a" />
            </View>
            <Text className="text-xl font-semibold text-gray-900">PDF ready!</Text>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <View className="bg-white rounded-xl p-4 mb-6">
              <Text className="text-lg font-semibold text-gray-900 text-center">
                {formatDate(plan.startTime)}
              </Text>
              <Text className="text-sm text-gray-500 text-center mt-1">
                {plan.activities.length} period{plan.activities.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <Text className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Choose Template
            </Text>
            <View className="flex-row gap-3 mb-6">
              {PDF_TEMPLATES.map((template) => {
                const isSelected = pdfSelectedTemplate === template.id;
                return (
                  <Pressable
                    key={template.id}
                    onPress={() => setPdfSelectedTemplate(template.id)}
                    disabled={pdfIsGenerating || !canExportPDF}
                    className={`flex-1 items-center p-4 rounded-xl border-2 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    } ${(pdfIsGenerating || !canExportPDF) ? 'opacity-50' : ''}`}
                  >
                    <View className="mb-2">
                      {isSelected
                        ? TEMPLATE_ICONS_SELECTED[template.id]
                        : TEMPLATE_ICONS[template.id]}
                    </View>
                    <Text
                      className={`text-sm font-semibold ${
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

            <View className="bg-white rounded-xl p-4 mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">Share Options</Text>

              {shareUrl ? (
                <View className="gap-3">
                  <View className="flex-row items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Link2 size={16} color={COLORS.textSecondary} />
                    <Text
                      className="flex-1 text-sm text-gray-600"
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {shareUrl}
                    </Text>
                    <Pressable onPress={copyShareUrl} className="p-2">
                      <Share2 size={18} color={COLORS.textSecondary} />
                    </Pressable>
                    <Pressable onPress={handleOpenShareUrl} className="p-2">
                      <ExternalLink size={18} color={COLORS.textSecondary} />
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={handleEmail}
                    className="flex-row items-center justify-center py-3 rounded-lg border border-gray-200 bg-white"
                  >
                    <Mail size={18} color={COLORS.primary} />
                    <Text className="ml-2 text-sm font-medium text-primary-500">
                      Email Plan
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={generateShareUrl}
                    disabled={shareLoading || !team?.id}
                    className={`flex-1 flex-row items-center justify-center py-3 rounded-lg border border-gray-200 bg-white ${
                      shareLoading ? 'opacity-50' : ''
                    }`}
                  >
                    {shareLoading ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Link2 size={18} color={COLORS.primary} />
                    )}
                    <Text className="ml-2 text-sm font-medium text-primary-500">
                      Generate Link
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleEmail}
                    className="flex-row items-center justify-center px-4 py-3 rounded-lg border border-gray-200 bg-white"
                  >
                    <Mail size={18} color={COLORS.primary} />
                  </Pressable>
                </View>
              )}
            </View>

            <View className="gap-3">
              <Pressable
                onPress={() => handleGenerate('print')}
                disabled={pdfIsGenerating || !canExportPDF}
                className={`flex-row items-center justify-center py-4 rounded-xl border-2 ${
                  canExportPDF
                    ? 'border-primary-500 bg-white'
                    : 'border-gray-200 bg-gray-50'
                } ${pdfIsGenerating ? 'opacity-50' : ''}`}
              >
                {pdfIsGenerating ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : canExportPDF ? (
                  <Printer size={20} color={COLORS.primary} />
                ) : (
                  <Lock size={20} color={COLORS.textMuted} />
                )}
                <Text
                  className={`ml-3 text-base font-semibold ${
                    canExportPDF ? 'text-primary-500' : 'text-gray-400'
                  }`}
                >
                  Print / Save as PDF
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleGenerate('share')}
                disabled={pdfIsGenerating || !canExportPDF}
                className={`flex-row items-center justify-center py-4 rounded-xl ${
                  canExportPDF ? 'bg-primary-500' : 'bg-gray-200'
                } ${pdfIsGenerating ? 'opacity-50' : ''}`}
              >
                {pdfIsGenerating ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : canExportPDF ? (
                  <Share2 size={20} color={COLORS.white} />
                ) : (
                  <Lock size={20} color={COLORS.textMuted} />
                )}
                <Text
                  className={`ml-3 text-base font-semibold ${
                    canExportPDF ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  Share PDF
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

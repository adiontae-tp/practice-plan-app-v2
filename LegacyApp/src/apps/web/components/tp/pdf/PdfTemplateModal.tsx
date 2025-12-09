'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import {
  FileText,
  FileStack,
  FileSpreadsheet,
  Download,
  Printer,
  Loader2,
  CheckCircle2,
  Mail,
  Link2,
  Copy,
  Check,
  Lock,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@ppa/store';
import { generatePlanHTML, PDF_TEMPLATES, type PDFTemplate } from '@ppa/pdf';
import { enablePlanSharing } from '@ppa/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';

const TEMPLATE_ICONS: Record<PDFTemplate, React.ReactNode> = {
  standard: <FileText className="w-8 h-8" />,
  compact: <FileStack className="w-8 h-8" />,
  detailed: <FileSpreadsheet className="w-8 h-8" />,
};

interface PdfTemplateModalProps {
  teamName?: string;
  teamSport?: string;
  headCoachName?: string;
  logoUrl?: string;
  primaryColor?: string;
  teamId?: string;
}

export function PdfTemplateModal({
  teamName,
  teamSport,
  headCoachName,
  logoUrl,
  primaryColor,
  teamId,
}: PdfTemplateModalProps) {
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  const { checkFeature, features } = useSubscription();
  const canExportPDF = features.canExportPDF;

  const pdfShowTemplateModal = useAppStore((s) => s.pdfShowTemplateModal);
  const pdfSelectedPlan = useAppStore((s) => s.pdfSelectedPlan);
  const pdfSelectedTemplate = useAppStore((s) => s.pdfSelectedTemplate);
  const pdfIsGenerating = useAppStore((s) => s.pdfIsGenerating);
  const setPdfSelectedTemplate = useAppStore((s) => s.setPdfSelectedTemplate);
  const setPdfIsGenerating = useAppStore((s) => s.setPdfIsGenerating);
  const closePdfTemplateModal = useAppStore((s) => s.closePdfTemplateModal);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (pdfShowTemplateModal) {
      setShareUrl(null);
      setCopied(false);
      setShowPreview(false);
      setPreviewHtml('');
      // Check if plan already has a share token
      if (pdfSelectedPlan?.shareEnabled && pdfSelectedPlan?.shareToken) {
        setShareUrl(`${window.location.origin}/share/${pdfSelectedPlan.shareToken}`);
      }
    }
  }, [pdfShowTemplateModal, pdfSelectedPlan]);

  const generateShareUrl = useCallback(async () => {
    if (!pdfSelectedPlan || !teamId) return;

    setShareLoading(true);
    try {
      const token = await enablePlanSharing(teamId, pdfSelectedPlan.id);
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setShareLoading(false);
    }
  }, [pdfSelectedPlan, teamId]);

  const copyShareUrl = useCallback(async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [shareUrl]);

  const handleEmail = useCallback(() => {
    if (!pdfSelectedPlan) return;

    const planDate = new Date(pdfSelectedPlan.startTime).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const subject = encodeURIComponent(`Practice Plan - ${planDate}`);
    let body = `Practice Plan for ${planDate}`;
    
    if (teamName) {
      body += `\nTeam: ${teamName}`;
    }
    
    if (shareUrl) {
      body += `\n\nView online: ${shareUrl}`;
    } else {
      body += `\n\n(Generate a share link to include a viewable link in your email)`;
    }

    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`);
  }, [pdfSelectedPlan, teamName, shareUrl]);

  const handlePreview = useCallback(() => {
    if (!pdfSelectedPlan) return;

    if (!checkFeature('canExportPDF')) {
      return;
    }

    const html = generatePlanHTML(pdfSelectedPlan, {
      template: pdfSelectedTemplate,
      teamName,
      teamSport,
      headCoachName,
      logoUrl,
      primaryColor,
      shareUrl: shareUrl || undefined,
    });

    setPreviewHtml(html);
    setShowPreview(true);
  }, [pdfSelectedPlan, pdfSelectedTemplate, teamName, teamSport, headCoachName, logoUrl, primaryColor, shareUrl, checkFeature]);

  const handleGenerate = useCallback(
    async (action: 'print' | 'download') => {
      if (!pdfSelectedPlan) return;

      if (!checkFeature('canExportPDF')) {
        return;
      }

      setPdfIsGenerating(true);

      try {
        const html = generatePlanHTML(pdfSelectedPlan, {
          template: pdfSelectedTemplate,
          teamName,
          teamSport,
          headCoachName,
          logoUrl,
          primaryColor,
          shareUrl: shareUrl || undefined,
        });

        if (action === 'print') {
          let iframe = printFrameRef.current;
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);
            printFrameRef.current = iframe;
          }

          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(html);
            doc.close();

            iframe.onload = () => {
              setTimeout(() => {
                iframe?.contentWindow?.print();
                setPdfIsGenerating(false);
                setShowSuccess(true);
                setTimeout(() => {
                  setShowSuccess(false);
                  closePdfTemplateModal();
                }, 1500);
              }, 100);
            };

            setTimeout(() => {
              if (pdfIsGenerating) {
                iframe?.contentWindow?.print();
                setPdfIsGenerating(false);
                setShowSuccess(true);
                setTimeout(() => {
                  setShowSuccess(false);
                  closePdfTemplateModal();
                }, 1500);
              }
            }, 500);
          }
        } else {
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const date = new Date(pdfSelectedPlan.startTime);
          const dateStr = date.toISOString().split('T')[0];
          a.download = `Practice_Plan_${dateStr}_${pdfSelectedTemplate}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

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
      logoUrl,
      primaryColor,
      shareUrl,
      setPdfIsGenerating,
      closePdfTemplateModal,
      pdfIsGenerating,
      checkFeature,
    ]
  );

  const handleClose = useCallback(() => {
    if (!pdfIsGenerating) {
      setShowPreview(false);
      closePdfTemplateModal();
    }
  }, [pdfIsGenerating, closePdfTemplateModal]);

  if (!pdfSelectedPlan) return null;

  // Preview Mode
  if (showPreview) {
    return (
      <Dialog open={pdfShowTemplateModal} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Preview</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                Back to Options
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full h-[60vh] border rounded-lg overflow-hidden bg-white">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full"
              title="PDF Preview"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => handleGenerate('download')}
              disabled={pdfIsGenerating || !canExportPDF}
            >
              {pdfIsGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : !canExportPDF ? (
                <Lock className="w-4 h-4 mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download
            </Button>
            <Button
              onClick={() => handleGenerate('print')}
              disabled={pdfIsGenerating || !canExportPDF}
              className="bg-[#356793] hover:bg-[#2a5275]"
            >
              {pdfIsGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : !canExportPDF ? (
                <Lock className="w-4 h-4 mr-2" />
              ) : (
                <Printer className="w-4 h-4 mr-2" />
              )}
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={pdfShowTemplateModal} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export as PDF</DialogTitle>
          <DialogDescription>
            Choose a template style for your practice plan
          </DialogDescription>
        </DialogHeader>

        {/* Subscription Lock Banner */}
        {!canExportPDF && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Premium Feature</p>
              <p className="text-xs text-amber-600">Upgrade to export practice plans as PDF</p>
            </div>
            <Button
              size="sm"
              onClick={() => checkFeature('canExportPDF')}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Upgrade
            </Button>
          </div>
        )}

        {/* Success State */}
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-900">
              PDF ready!
            </p>
          </div>
        ) : (
          <>
            {/* Template Selection */}
            <div className="grid grid-cols-3 gap-3 py-4">
              {PDF_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setPdfSelectedTemplate(template.id)}
                  disabled={pdfIsGenerating || !canExportPDF}
                  className={cn(
                    'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
                    pdfSelectedTemplate === template.id
                      ? 'border-[#356793] bg-[#356793]/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    (pdfIsGenerating || !canExportPDF) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div
                    className={cn(
                      'mb-2',
                      pdfSelectedTemplate === template.id
                        ? 'text-[#356793]'
                        : 'text-gray-500'
                    )}
                  >
                    {TEMPLATE_ICONS[template.id]}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      pdfSelectedTemplate === template.id
                        ? 'text-[#356793]'
                        : 'text-gray-700'
                    )}
                  >
                    {template.name}
                  </span>
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {template.description}
                  </span>
                </button>
              ))}
            </div>

            {/* Share Link Section */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Share Options</p>
              
              {shareUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Link2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyShareUrl}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(shareUrl, '_blank')}
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEmail}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Plan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateShareUrl}
                    disabled={shareLoading || !teamId}
                    className="flex-1"
                  >
                    {shareLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4 mr-2" />
                    )}
                    Generate Share Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEmail}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              )}
            </div>

            {/* Actions */}
            <DialogFooter className="gap-2 sm:gap-2 border-t pt-4 mt-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={pdfIsGenerating || !canExportPDF}
              >
                {!canExportPDF ? (
                  <Lock className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerate('download')}
                disabled={pdfIsGenerating || !canExportPDF}
              >
                {pdfIsGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : !canExportPDF ? (
                  <Lock className="w-4 h-4 mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download
              </Button>
              <Button
                onClick={() => handleGenerate('print')}
                disabled={pdfIsGenerating || !canExportPDF}
                className="bg-[#356793] hover:bg-[#2a5275]"
              >
                {pdfIsGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : !canExportPDF ? (
                  <Lock className="w-4 h-4 mr-2" />
                ) : (
                  <Printer className="w-4 h-4 mr-2" />
                )}
                Print / Save as PDF
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

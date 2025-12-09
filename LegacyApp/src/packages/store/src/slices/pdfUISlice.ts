import { StateCreator } from 'zustand';
import type { Plan } from '@ppa/interfaces';

export type PDFTemplate = 'standard' | 'compact' | 'detailed';

export interface PdfUISlice {
  // Modal state
  pdfShowTemplateModal: boolean;
  pdfSelectedPlan: Plan | null;
  pdfSelectedTemplate: PDFTemplate;
  pdfIsGenerating: boolean;
  pdfError: string | null;

  // Actions
  setPdfShowTemplateModal: (show: boolean) => void;
  setPdfSelectedPlan: (plan: Plan | null) => void;
  setPdfSelectedTemplate: (template: PDFTemplate) => void;
  setPdfIsGenerating: (generating: boolean) => void;
  setPdfError: (error: string | null) => void;
  openPdfTemplateModal: (plan: Plan) => void;
  closePdfTemplateModal: () => void;
  resetPdfUI: () => void;
}

const initialState = {
  pdfShowTemplateModal: false,
  pdfSelectedPlan: null as Plan | null,
  pdfSelectedTemplate: 'standard' as PDFTemplate,
  pdfIsGenerating: false,
  pdfError: null as string | null,
};

export const createPdfUISlice: StateCreator<PdfUISlice> = (set) => ({
  ...initialState,

  setPdfShowTemplateModal: (show) => set({ pdfShowTemplateModal: show }),
  setPdfSelectedPlan: (plan) => set({ pdfSelectedPlan: plan }),
  setPdfSelectedTemplate: (template) => set({ pdfSelectedTemplate: template }),
  setPdfIsGenerating: (generating) => set({ pdfIsGenerating: generating }),
  setPdfError: (error) => set({ pdfError: error }),

  openPdfTemplateModal: (plan) =>
    set({
      pdfShowTemplateModal: true,
      pdfSelectedPlan: plan,
      pdfSelectedTemplate: 'standard',
      pdfError: null,
    }),

  closePdfTemplateModal: () =>
    set({
      pdfShowTemplateModal: false,
      pdfSelectedPlan: null,
      pdfIsGenerating: false,
      pdfError: null,
    }),

  resetPdfUI: () => set(initialState),
});

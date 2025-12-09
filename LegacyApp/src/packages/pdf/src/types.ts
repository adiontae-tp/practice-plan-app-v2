/**
 * PDF Template Types
 */

export type PDFTemplate = 'standard' | 'compact' | 'detailed';

export interface PDFTemplateInfo {
  id: PDFTemplate;
  name: string;
  description: string;
}

export const PDF_TEMPLATES: PDFTemplateInfo[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Clean table layout with time, activity, and notes',
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Single-page bordered layout for quick reference',
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Card-based layout with full activity details',
  },
];

export interface PDFOptions {
  template?: PDFTemplate;
  teamName?: string;
  teamSport?: string;
  headCoachName?: string;
  logoUrl?: string;
  shareUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

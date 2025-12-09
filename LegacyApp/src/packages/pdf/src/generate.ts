/**
 * PDF HTML Generation
 * Platform-agnostic HTML generation for practice plan PDFs
 */
import type { Plan } from '@ppa/interfaces';
import type { PDFOptions, PDFTemplate } from './types';
import { generateStandardHTML } from './templates/standard';
import { generateCompactHTML } from './templates/compact';
import { generateDetailedHTML } from './templates/detailed';

/**
 * Generates HTML content for a practice plan PDF
 * @param plan - The practice plan to convert to HTML
 * @param options - Optional PDF options including template type
 * @returns HTML string ready for PDF generation
 */
export function generatePlanHTML(plan: Plan, options?: PDFOptions): string {
  const template: PDFTemplate = options?.template || 'standard';

  switch (template) {
    case 'compact':
      return generateCompactHTML(plan, options);
    case 'detailed':
      return generateDetailedHTML(plan, options);
    case 'standard':
    default:
      return generateStandardHTML(plan, options);
  }
}

/**
 * Generates a filename for the PDF
 * @param plan - The practice plan
 * @param template - The template type
 * @returns Filename string
 */
export function generatePDFFilename(plan: Plan, template: PDFTemplate = 'standard'): string {
  const date = new Date(plan.startTime);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const templateSuffix = template !== 'standard' ? `_${template}` : '';
  return `Practice_Plan_${dateStr}${templateSuffix}.pdf`;
}

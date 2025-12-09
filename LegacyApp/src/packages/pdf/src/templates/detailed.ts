/**
 * Detailed Template - Card-based layout with comprehensive activity details
 * Each activity displayed as a distinct card with all information
 */
import type { Plan, Tag } from '@ppa/interfaces';
import type { PDFOptions } from '../types';
import { formatTime, formatTimeRange, formatDateShort, formatDuration, generateQRCodeSVG } from '../utils';

export function generateDetailedHTML(plan: Plan, options?: PDFOptions): string {
  const planDate = formatDateShort(plan.startTime);
  const totalDuration = formatDuration(plan.duration);
  const startTime = formatTime(plan.startTime);
  const endTime = formatTime(plan.endTime);
  const primaryColor = options?.primaryColor || '#356793';

  const richTextStyles = `
    .notes-content p { margin: 0 0 8px 0; }
    .notes-content p:last-child { margin-bottom: 0; }
    .notes-content strong, .notes-content b { font-weight: bold; }
    .notes-content em, .notes-content i { font-style: italic; }
    .notes-content u { text-decoration: underline; }
    .notes-content ul, .notes-content ol { margin: 6px 0; padding-left: 20px; }
    .notes-content li { margin: 3px 0; }
    .notes-content a { color: ${primaryColor}; text-decoration: underline; }
  `;

  const hasLogo = !!options?.logoUrl;
  const hasQR = !!options?.shareUrl;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Practice Plan - ${planDate}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1a1a1a;
      padding: 24px;
      background: #fff;
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${primaryColor};
    }

    .header-top {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .logo {
      height: 60px;
      width: auto;
      object-fit: contain;
    }

    .title-section {
      flex: 1;
      text-align: center;
    }

    .title {
      font-size: 32px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .team-name {
      font-size: 18px;
      font-weight: 600;
      color: ${primaryColor};
      margin-bottom: 16px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 16px 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .meta-item {
      text-align: center;
    }

    .meta-label {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      color: #666;
      margin-bottom: 4px;
    }

    .meta-value {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 14px;
    }

    .activities-header {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${primaryColor};
      margin: 28px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }

    .activity-card {
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      margin-bottom: 16px;
      overflow: hidden;
      page-break-inside: avoid;
    }

    .activity-header {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .activity-number {
      width: 36px;
      height: 36px;
      background: ${primaryColor};
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      margin-right: 14px;
      flex-shrink: 0;
    }

    .activity-title-section {
      flex: 1;
    }

    .activity-name {
      font-size: 17px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 2px;
    }

    .activity-time {
      font-size: 13px;
      color: #666;
    }

    .activity-duration {
      font-size: 14px;
      font-weight: 600;
      color: ${primaryColor};
      background: #e8f0f7;
      padding: 6px 12px;
      border-radius: 20px;
    }

    .activity-body {
      padding: 16px;
    }

    .activity-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }

    .tag {
      display: inline-block;
      padding: 4px 10px;
      background: #e8f0f7;
      color: ${primaryColor};
      font-size: 11px;
      font-weight: 600;
      border-radius: 12px;
    }

    .activity-notes-label {
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      margin-bottom: 8px;
    }

    .activity-notes {
      font-size: 13px;
      line-height: 1.6;
      color: #333;
      padding: 12px 14px;
      background: #fafafa;
      border-radius: 6px;
      border-left: 3px solid ${primaryColor};
    }

    .no-notes {
      color: #999;
      font-style: italic;
    }

    .practice-notes-section {
      margin-top: 32px;
      padding: 20px;
      border: 2px solid ${primaryColor};
      border-radius: 10px;
      background: #f8fbfd;
    }

    .practice-notes-title {
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      color: ${primaryColor};
    }

    .practice-notes-content {
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }

    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #999;
    }

    .footer-text {
      text-align: center;
    }

    .qr-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: auto;
    }

    .qr-code {
      width: 60px;
      height: 60px;
    }

    .qr-label {
      font-size: 10px;
      color: #666;
      text-align: right;
    }

    ${richTextStyles}

    @media print {
      body {
        padding: 16px;
      }
      .activity-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      ${hasLogo ? `<img src="${options.logoUrl}" alt="Team Logo" class="logo" />` : ''}
      <div class="title-section">
        <div class="title">Practice Plan</div>
        ${options?.teamName ? `<div class="team-name">${options.teamName}${options.teamSport ? ` · ${options.teamSport}` : ''}</div>` : ''}
      </div>
      ${hasLogo ? '<div style="width: 60px;"></div>' : ''}
    </div>
    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Date</div>
        <div class="meta-value">${planDate}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Time</div>
        <div class="meta-value">${startTime} - ${endTime}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Duration</div>
        <div class="meta-value">${totalDuration}</div>
      </div>
      ${options?.headCoachName ? `
      <div class="meta-item">
        <div class="meta-label">Head Coach</div>
        <div class="meta-value">${options.headCoachName}</div>
      </div>
      ` : `
      <div class="meta-item">
        <div class="meta-label">Activities</div>
        <div class="meta-value">${plan.activities.length}</div>
      </div>
      `}
    </div>
  </div>

  <div class="activities-header">Activity Schedule</div>`;

  plan.activities.forEach((activity, index) => {
    const timeRange = formatTimeRange(activity.startTime, activity.endTime);
    const activityDuration = formatDuration(activity.duration);

    const tagNames: string[] = [];
    if (activity.tags && Array.isArray(activity.tags)) {
      activity.tags.forEach((tag) => {
        if (typeof tag === 'object' && 'name' in tag) {
          tagNames.push((tag as Tag).name);
        }
      });
    }

    html += `
  <div class="activity-card">
    <div class="activity-header">
      <div class="activity-number">${index + 1}</div>
      <div class="activity-title-section">
        <div class="activity-name">${activity.name}</div>
        <div class="activity-time">${timeRange}</div>
      </div>
      <div class="activity-duration">${activityDuration}</div>
    </div>
    <div class="activity-body">`;

    if (tagNames.length > 0) {
      html += `
      <div class="activity-tags">
        ${tagNames.map(name => `<span class="tag">${name}</span>`).join('')}
      </div>`;
    }

    html += `
      <div class="activity-notes-label">Notes</div>
      <div class="activity-notes notes-content">
        ${activity.notes || '<span class="no-notes">No notes for this activity</span>'}
      </div>
    </div>
  </div>`;
  });

  if (plan.notes) {
    html += `
  <div class="practice-notes-section">
    <div class="practice-notes-title">Practice Notes</div>
    <div class="practice-notes-content notes-content">${plan.notes}</div>
  </div>`;
  }

  html += `
  <div class="footer">
    <span class="footer-text">Practice Plan App</span>
    ${hasQR ? `
    <div class="qr-section">
      <div class="qr-label">Scan to view online</div>
      <img src="${generateQRCodeSVG(options.shareUrl!, 60)}" alt="QR Code" class="qr-code" />
    </div>
    ` : ''}
  </div>
</body>
</html>`;

  return html;
}

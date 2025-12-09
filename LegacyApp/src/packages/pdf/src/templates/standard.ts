/**
 * Standard Template - Professional table format for coaches
 * Similar to traditional practice plan layouts used in sports
 */
import type { Plan } from '@ppa/interfaces';
import type { PDFOptions } from '../types';
import { formatTimeRange, formatDateShort, formatDuration, generateQRCodeSVG } from '../utils';

export function generateStandardHTML(plan: Plan, options?: PDFOptions): string {
  const planDate = formatDateShort(plan.startTime);
  const totalDuration = formatDuration(plan.duration);
  const primaryColor = options?.primaryColor || '#356793';

  const richTextStyles = `
    .notes-content p { margin: 0 0 8px 0; }
    .notes-content p:last-child { margin-bottom: 0; }
    .notes-content strong, .notes-content b { font-weight: bold; }
    .notes-content em, .notes-content i { font-style: italic; }
    .notes-content u { text-decoration: underline; }
    .notes-content ul, .notes-content ol { margin: 4px 0; padding-left: 20px; }
    .notes-content li { margin: 2px 0; }
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
      padding: 20px 24px;
      background: #fff;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 20px;
    }

    .header-top {
      display: flex;
      align-items: center;
      justify-content: ${hasLogo ? 'space-between' : 'center'};
      margin-bottom: 16px;
    }

    .logo {
      height: 60px;
      width: auto;
      object-fit: contain;
    }

    .title-section {
      text-align: center;
      flex: 1;
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #1a1a1a;
    }

    .team-name {
      font-size: 16px;
      color: ${primaryColor};
      font-weight: 600;
      margin-top: 4px;
    }

    .meta-row {
      display: flex;
      justify-content: center;
      gap: 40px;
      padding: 12px 20px;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 14px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meta-label {
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-weight: 600;
      color: #1a1a1a;
    }

    .practice-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
    }

    .practice-table th {
      background: ${primaryColor};
      color: #fff;
      padding: 14px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .practice-table th:first-child {
      border-radius: 6px 0 0 0;
    }

    .practice-table th:last-child {
      border-radius: 0 6px 0 0;
    }

    .practice-table td {
      padding: 14px 12px;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: top;
      font-size: 13px;
      line-height: 1.5;
    }

    .practice-table tbody tr:nth-child(even) {
      background: #f8f9fa;
    }

    .practice-table tbody tr:last-child td {
      border-bottom: 2px solid ${primaryColor};
    }

    .practice-table tbody tr:last-child td:first-child {
      border-radius: 0 0 0 6px;
    }

    .practice-table tbody tr:last-child td:last-child {
      border-radius: 0 0 6px 0;
    }

    .time-col {
      width: 18%;
      font-weight: 600;
      white-space: nowrap;
      color: ${primaryColor};
    }

    .activity-col {
      width: 25%;
      font-weight: 600;
    }

    .duration-col {
      width: 12%;
      text-align: center;
      color: #666;
    }

    .notes-col {
      width: 45%;
    }

    .notes-content {
      font-size: 13px;
      line-height: 1.5;
      color: #444;
    }

    .practice-notes {
      margin-top: 30px;
      padding: 20px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .practice-notes-title {
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      color: ${primaryColor};
    }

    .practice-notes-content {
      font-size: 13px;
      line-height: 1.6;
      color: #333;
    }

    .coach-notes-section {
      margin-top: 30px;
      padding: 20px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      min-height: 100px;
    }

    .coach-notes-title {
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999;
      margin-bottom: 8px;
    }

    .coach-notes-lines {
      border-bottom: 1px solid #ddd;
      height: 24px;
      margin-bottom: 8px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: ${hasQR ? 'space-between' : 'center'};
    }

    .footer-text {
      font-size: 10px;
      color: #999;
    }

    .qr-section {
      display: flex;
      align-items: center;
      gap: 12px;
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
        padding: 12px 16px;
      }
      .practice-table {
        page-break-inside: auto;
      }
      .practice-table tr {
        page-break-inside: avoid;
      }
      .coach-notes-section {
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
    <div class="meta-row">
      <div class="meta-item">
        <span class="meta-label">Date:</span>
        <span class="meta-value">${planDate}</span>
      </div>
      ${options?.headCoachName ? `
      <div class="meta-item">
        <span class="meta-label">Coach:</span>
        <span class="meta-value">${options.headCoachName}</span>
      </div>
      ` : ''}
      <div class="meta-item">
        <span class="meta-label">Duration:</span>
        <span class="meta-value">${totalDuration}</span>
      </div>
    </div>
  </div>

  <table class="practice-table">
    <thead>
      <tr>
        <th class="time-col">Time</th>
        <th class="activity-col">Activity</th>
        <th class="duration-col">Duration</th>
        <th class="notes-col">Notes</th>
      </tr>
    </thead>
    <tbody>`;

  plan.activities.forEach((activity) => {
    const timeRange = formatTimeRange(activity.startTime, activity.endTime);
    const activityDuration = formatDuration(activity.duration);
    const notes = activity.notes || '<span style="color: #999;">—</span>';

    html += `
      <tr>
        <td class="time-col">${timeRange}</td>
        <td class="activity-col">${activity.name}</td>
        <td class="duration-col">${activityDuration}</td>
        <td class="notes-col"><div class="notes-content">${notes}</div></td>
      </tr>`;
  });

  html += `
    </tbody>
  </table>`;

  if (plan.notes) {
    html += `
  <div class="practice-notes">
    <div class="practice-notes-title">Practice Notes</div>
    <div class="practice-notes-content notes-content">${plan.notes}</div>
  </div>`;
  }

  html += `
  <div class="coach-notes-section">
    <div class="coach-notes-title">Coach's Notes (for handwritten additions)</div>
    <div class="coach-notes-lines"></div>
    <div class="coach-notes-lines"></div>
    <div class="coach-notes-lines"></div>
  </div>

  <div class="footer">
    <span class="footer-text">Practice Plan App</span>
    ${hasQR ? `
    <div class="qr-section">
      <div class="qr-label">
        <div style="font-weight: 600;">Scan to view online</div>
        <div style="font-size: 9px; color: #999;">or share with your team</div>
      </div>
      <img src="${generateQRCodeSVG(options.shareUrl!, 60)}" alt="QR Code" class="qr-code" />
    </div>
    ` : ''}
  </div>
</body>
</html>`;

  return html;
}

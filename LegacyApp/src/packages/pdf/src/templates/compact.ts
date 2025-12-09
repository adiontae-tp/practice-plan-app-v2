/**
 * Compact Template - Space-efficient bordered layout for single-page printing
 * Inspired by organized practice plan formats with clean borders
 */
import type { Plan } from '@ppa/interfaces';
import type { PDFOptions } from '../types';
import { formatTimeRange, formatDateShort, formatDuration, generateQRCodeSVG } from '../utils';

export function generateCompactHTML(plan: Plan, options?: PDFOptions): string {
  const planDate = formatDateShort(plan.startTime);
  const totalDuration = formatDuration(plan.duration);
  const primaryColor = options?.primaryColor || '#356793';

  const richTextStyles = `
    .notes-content p { margin: 0 0 4px 0; }
    .notes-content p:last-child { margin-bottom: 0; }
    .notes-content strong, .notes-content b { font-weight: bold; }
    .notes-content em, .notes-content i { font-style: italic; }
    .notes-content u { text-decoration: underline; }
    .notes-content ul, .notes-content ol { margin: 2px 0; padding-left: 16px; }
    .notes-content li { margin: 1px 0; }
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
      font-size: 12px;
      line-height: 1.4;
      color: #1a1a1a;
      padding: 16px;
      background: #fff;
    }

    .container {
      border: 3px solid ${primaryColor};
      border-radius: 8px;
      overflow: hidden;
    }

    .header {
      background: ${primaryColor};
      color: #fff;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: ${hasLogo ? 'space-between' : 'center'};
    }

    .logo {
      height: 40px;
      width: auto;
      object-fit: contain;
      background: white;
      padding: 4px;
      border-radius: 4px;
    }

    .title {
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
      flex: 1;
    }

    .meta-section {
      display: flex;
      border-bottom: 2px solid ${primaryColor};
    }

    .meta-item {
      flex: 1;
      padding: 10px 16px;
      border-right: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meta-item:last-child {
      border-right: none;
    }

    .meta-label {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      color: #666;
    }

    .meta-value {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 12px;
    }

    .practice-table {
      width: 100%;
      border-collapse: collapse;
    }

    .practice-table th {
      background: #f0f4f8;
      color: ${primaryColor};
      padding: 10px 12px;
      text-align: left;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid ${primaryColor};
    }

    .practice-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: top;
      font-size: 11px;
      line-height: 1.4;
    }

    .practice-table tbody tr:nth-child(even) {
      background: #fafbfc;
    }

    .practice-table tbody tr:last-child td {
      border-bottom: none;
    }

    .time-col {
      width: 20%;
      font-weight: 600;
      color: ${primaryColor};
      white-space: nowrap;
    }

    .activity-col {
      width: 25%;
      font-weight: 600;
    }

    .duration-col {
      width: 10%;
      text-align: center;
      color: #666;
    }

    .notes-col {
      width: 45%;
    }

    .notes-content {
      font-size: 11px;
      line-height: 1.4;
      color: #444;
    }

    .bottom-section {
      border-top: 2px solid ${primaryColor};
    }

    .practice-notes {
      padding: 12px 16px;
      background: #f8f9fa;
    }

    .practice-notes-title {
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      color: ${primaryColor};
    }

    .practice-notes-content {
      font-size: 11px;
      line-height: 1.5;
      color: #333;
    }

    .footer {
      padding: 8px 16px;
      background: #f0f4f8;
      display: flex;
      align-items: center;
      justify-content: ${hasQR ? 'space-between' : 'center'};
      border-top: 1px solid #e0e0e0;
    }

    .footer-text {
      font-size: 9px;
      color: #666;
    }

    .qr-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qr-code {
      width: 40px;
      height: 40px;
    }

    .qr-label {
      font-size: 9px;
      color: #666;
      text-align: right;
    }

    ${richTextStyles}

    @media print {
      body {
        padding: 8px;
      }
      .container {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${hasLogo ? `<img src="${options.logoUrl}" alt="Team Logo" class="logo" />` : ''}
      <div class="title">Practice Plan</div>
      ${hasLogo ? '<div style="width: 48px;"></div>' : ''}
    </div>

    <div class="meta-section">
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
      ${options?.teamName ? `
      <div class="meta-item">
        <span class="meta-label">Team:</span>
        <span class="meta-value">${options.teamName}</span>
      </div>
      ` : ''}
      <div class="meta-item">
        <span class="meta-label">Duration:</span>
        <span class="meta-value">${totalDuration}</span>
      </div>
    </div>

    <table class="practice-table">
      <thead>
        <tr>
          <th class="time-col">Time</th>
          <th class="activity-col">Activity</th>
          <th class="duration-col">Dur.</th>
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
    <div class="bottom-section">
      <div class="practice-notes">
        <div class="practice-notes-title">Practice Notes</div>
        <div class="practice-notes-content notes-content">${plan.notes}</div>
      </div>
    </div>`;
  }

  html += `
    <div class="footer">
      <span class="footer-text">Practice Plan App</span>
      ${hasQR ? `
      <div class="qr-section">
        <div class="qr-label">Scan to view</div>
        <img src="${generateQRCodeSVG(options.shareUrl!, 40)}" alt="QR Code" class="qr-code" />
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;

  return html;
}

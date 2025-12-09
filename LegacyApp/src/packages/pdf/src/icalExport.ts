import { Plan } from '@ppa/interfaces';

/**
 * Formats a Date to iCal datetime format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters for iCal text fields
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates a unique UID for the calendar event
 */
function generateUID(planId: string): string {
  return `${planId}@practiceplanapp.com`;
}

/**
 * Formats activities/periods into a description
 */
function formatDescription(plan: Plan, teamName?: string): string {
  const lines: string[] = [];

  if (teamName) {
    lines.push(`Team: ${teamName}`);
  }

  if (plan.activities && plan.activities.length > 0) {
    lines.push('');
    lines.push('Periods:');
    plan.activities.forEach((activity, index) => {
      const duration = activity.duration ? `(${activity.duration}min)` : '';
      lines.push(`${index + 1}. ${activity.name} ${duration}`);
      if (activity.notes) {
        lines.push(`   Notes: ${activity.notes}`);
      }
    });
  }

  if (plan.notes) {
    lines.push('');
    lines.push(`Notes: ${plan.notes}`);
  }

  return escapeICalText(lines.join('\n'));
}

/**
 * Formats the practice date for the summary
 */
function formatSummaryDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export interface ICalExportOptions {
  teamName?: string;
  eventTitle?: string;
}

/**
 * Generates an iCal (.ics) string for a single practice plan
 */
export function generateICalEvent(plan: Plan, options: ICalExportOptions = {}): string {
  const { teamName, eventTitle } = options;

  const now = formatICalDate(Date.now());
  const dtStart = formatICalDate(plan.startTime);
  const dtEnd = formatICalDate(plan.endTime);
  const uid = generateUID(plan.id);

  // Build the summary (event title)
  const dateStr = formatSummaryDate(plan.startTime);
  const summary = eventTitle
    ? escapeICalText(eventTitle)
    : escapeICalText(teamName ? `${teamName} Practice - ${dateStr}` : `Practice - ${dateStr}`);

  const description = formatDescription(plan, teamName);

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Practice Plan App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icalContent;
}

/**
 * Generates an iCal (.ics) string for multiple practice plans
 */
export function generateICalEvents(plans: Plan[], options: ICalExportOptions = {}): string {
  const { teamName } = options;

  const now = formatICalDate(Date.now());

  const events = plans.map((plan) => {
    const dtStart = formatICalDate(plan.startTime);
    const dtEnd = formatICalDate(plan.endTime);
    const uid = generateUID(plan.id);
    const dateStr = formatSummaryDate(plan.startTime);
    const summary = escapeICalText(teamName ? `${teamName} Practice - ${dateStr}` : `Practice - ${dateStr}`);
    const description = formatDescription(plan, teamName);

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT',
    ].join('\r\n');
  });

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Practice Plan App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  return icalContent;
}

/**
 * Generates a filename for the iCal export
 */
export function generateICalFilename(plan: Plan, teamName?: string): string {
  const date = new Date(plan.startTime);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const prefix = teamName ? teamName.replace(/[^a-zA-Z0-9]/g, '_') : 'practice';
  return `${prefix}_${dateStr}.ics`;
}

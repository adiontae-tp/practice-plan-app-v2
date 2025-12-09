import { useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Plan } from '@ppa/interfaces';
import { generateICalEvent, generateICalFilename } from '@ppa/pdf';
import { useAppStore } from '@ppa/store';

export function useCalendarExport() {
  const team = useAppStore((state) => state.team);

  const exportToCalendar = useCallback(async (plan: Plan) => {
    try {
      // Generate iCal content
      const icalContent = generateICalEvent(plan, {
        teamName: team?.name,
      });

      // Generate filename
      const filename = generateICalFilename(plan, team?.name);

      // Write to temp file
      const filePath = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(filePath, icalContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      // Share the file
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/calendar',
        dialogTitle: 'Add to Calendar',
        UTI: 'com.apple.ical.ics', // iOS-specific
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to export to calendar:', error);
      return { success: false, error };
    }
  }, [team?.name]);

  return { exportToCalendar };
}

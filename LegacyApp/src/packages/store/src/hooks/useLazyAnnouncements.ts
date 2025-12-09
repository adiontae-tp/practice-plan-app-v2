import { useEffect } from 'react';
import { useAppStore } from '../store';

export function useLazyAnnouncements() {
  const announcements = useAppStore((state) => state.announcements);
  const team = useAppStore((state) => state.team);
  const isAnnouncementsSubscribed = useAppStore((state) => state.isAnnouncementsSubscribed);
  const subscribeToAnnouncementsData = useAppStore((state) => state.subscribeToAnnouncementsData);

  useEffect(() => {
    if (team?.id && !isAnnouncementsSubscribed) {
      subscribeToAnnouncementsData(team.id);
    }
  }, [team?.id, isAnnouncementsSubscribed, subscribeToAnnouncementsData]);

  return {
    announcements,
    isLoading: !isAnnouncementsSubscribed,
  };
}

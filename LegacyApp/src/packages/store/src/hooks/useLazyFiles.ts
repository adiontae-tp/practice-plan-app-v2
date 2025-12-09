import { useEffect } from 'react';
import { useAppStore } from '../store';

export function useLazyFiles() {
  const files = useAppStore((state) => state.files);
  const team = useAppStore((state) => state.team);
  const isFilesSubscribed = useAppStore((state) => state.isFilesSubscribed);
  const subscribeToFilesData = useAppStore((state) => state.subscribeToFilesData);

  useEffect(() => {
    if (team?.id && !isFilesSubscribed) {
      subscribeToFilesData(team.id);
    }
  }, [team?.id, isFilesSubscribed, subscribeToFilesData]);

  return {
    files,
    isLoading: !isFilesSubscribed,
  };
}

import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { subscribeToFolders } from '@ppa/firebase';

export function useLazyFolders() {
  const team = useAppStore((state) => state.team);
  const folders = useAppStore((state) => state.folders);
  const foldersLoading = useAppStore((state) => state.foldersLoading);
  const setFolders = useAppStore((state) => state.setFolders);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const subscribedTeamIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!team?.id) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        subscribedTeamIdRef.current = null;
      }
      return;
    }

    if (subscribedTeamIdRef.current === team.id) {
      return;
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    subscribedTeamIdRef.current = team.id;
    unsubscribeRef.current = subscribeToFolders(team.id, (foldersList) => {
      setFolders(foldersList);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        subscribedTeamIdRef.current = null;
      }
    };
  }, [team?.id, setFolders]);

  return { folders, isLoading: foldersLoading };
}

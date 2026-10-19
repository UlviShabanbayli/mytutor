import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Whether the device is online, as TanStack Query sees it: browser online/offline events on
 * the web; on phones it stays online until a NetInfo listener is wired into `onlineManager`
 * (proposal for the shared app setup, see the PR notes).
 */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}

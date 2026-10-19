import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Whether the app is online, as TanStack Query sees it (the browser's online events on the web;
 * on phones it stays online until a network-state listener is wired into `onlineManager`).
 */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}

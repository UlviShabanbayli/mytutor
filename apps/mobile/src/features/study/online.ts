import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange);
const isOnline = () => onlineManager.isOnline();

/**
 * Whether the device is online, as TanStack Query sees it: browser events on the web; on
 * phones it stays "online" until a network-state library feeds `onlineManager`.
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribe, isOnline, isOnline);
}

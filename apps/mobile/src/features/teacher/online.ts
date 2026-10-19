import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Whether the device is online, as TanStack Query sees it (browser events on the web; on
 * phones once a network listener is wired into onlineManager). Paused writes resume by
 * themselves when this turns true.
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}

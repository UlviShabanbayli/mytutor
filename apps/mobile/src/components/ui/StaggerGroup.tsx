import { type ReactNode, useEffect, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { StaggerGroupContext } from '@/features/transitions/staggerContext';

type StaggerGroupProps = {
  children: ReactNode;
};

/**
 * Around a list whose rows use `StaggerItem`: they come in one after another when the list
 * first shows (transitions.list C), never again on later renders or filter changes.
 */
export function StaggerGroup({ children }: StaggerGroupProps) {
  const settled = useSharedValue(false);
  useEffect(() => {
    settled.set(true);
  }, [settled]);
  const value = useMemo(() => ({ settled }), [settled]);

  return <StaggerGroupContext.Provider value={value}>{children}</StaggerGroupContext.Provider>;
}

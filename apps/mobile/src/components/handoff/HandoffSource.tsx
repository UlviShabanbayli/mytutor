import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { HexCell } from '@/components/ui';
import { useHandoffStore } from '@/features/transitions/handoffStore';

type HandoffSourceProps = {
  /** The topic number, e.g. "4.3". */
  code: string;
};

/**
 * The small topic cell in a test's header (transitions.handoff B). It keeps its place on the
 * screen up to date, so the result can fly it from here. Decorative: the badge names the topic.
 */
export function HandoffSource({ code }: HandoffSourceProps) {
  const ref = useRef<View>(null);
  const setSource = useHandoffStore((s) => s.setSource);

  // Measured after every render, not only on layout: the test slides in as it mounts, so its
  // first layout is not where the header ends up.
  useEffect(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0) setSource(code, { x, y, width, height });
    });
  });

  return (
    <View ref={ref}>
      <HexCell state="lesson_completed" size={24} label={code} />
    </View>
  );
}

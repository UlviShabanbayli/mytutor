import { FloatingZ } from './FloatingZ';

type SleepyZsProps = { size: number; moving: boolean; shown: boolean };

/**
 * The z's of a sleeping Vızı (vizi.sleepy B): a new one every 1.2s, two at most at a time.
 * Reduced motion: two still z's.
 */
export function SleepyZs({ size, moving, shown }: SleepyZsProps) {
  return (
    <>
      <FloatingZ
        size={size}
        moving={moving}
        shown={shown}
        font={0.15}
        drift={0.14}
        delay={0}
        still={[0, 0.06]}
      />
      <FloatingZ
        size={size}
        moving={moving}
        shown={shown}
        font={0.11}
        drift={0.1}
        delay={1200}
        still={[0.14, -0.08]}
      />
    </>
  );
}

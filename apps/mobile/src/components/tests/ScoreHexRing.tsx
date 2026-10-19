import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { hexPoints, ringSpots } from '@/components/feedback/motionMath';
import { PopIn } from '@/components/feedback/PopIn';
import { scoreC, scoreEnd } from '@/components/feedback/timelines';
import { Text } from '@/components/ui';
import { useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';

/** One question of the test: right, to review (crystal, never red), or with the teacher. */
export type ScoreMark = 'ok' | 'review' | 'pending';

type ScoreHexRingProps = {
  marks: ScoreMark[];
  correct: number;
  /** Questions the app scored itself (written ones wait for the teacher). */
  scored: number;
  size?: number;
};

const fills = { ok: 'honey', review: 'crystal', pending: 'info-bg' } as const;
const inks = { ok: 'text-on-honey', review: 'text-crystal-ink', pending: 'text-info' } as const;

/** The score as it counts up: one tick per right cell, 120ms after the cell pops. */
function useScoreTicks(marks: ScoreMark[], correct: number): number {
  const reduced = useReducedMotionPref();
  // The marks as one string, so a new array with the same marks does not restart the count.
  const key = marks.join(',');
  const [ticks, setTicks] = useState({ key, count: 0 });
  useEffect(() => {
    if (reduced) return;
    const tick = () => setTicks((t) => ({ key, count: (t.key === key ? t.count : 0) + 1 }));
    const timers = key
      .split(',')
      .flatMap((mark, i) =>
        mark === 'ok'
          ? [setTimeout(tick, scoreC.startAt + i * scoreC.stagger + scoreC.tickAfter)]
          : [],
      );
    return () => timers.forEach(clearTimeout);
  }, [key, reduced]);
  if (reduced) return correct;
  return ticks.key === key ? ticks.count : 0;
}

/**
 * feedback.score C: numbered hex cells around the score pop in one by one (90ms apart), crystal
 * for the questions to review; the score ticks with each right cell and pops at the end.
 * Decorative: the caller labels the result for screen readers.
 */
export function ScoreHexRing({ marks, correct, scored, size = 168 }: ScoreHexRingProps) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const count = useScoreTicks(marks, correct);
  const n = Math.max(1, marks.length);
  const radius = size / 2 - 16;
  const cw = Math.min(26, ((2 * Math.PI * radius) / n) * 0.82);
  const ch = cw * 1.125;
  const spots = ringSpots(n, radius, { x: size / 2, y: size / 2 });
  const end = scoreEnd(n);
  const percent = scored ? Math.round((count / scored) * 100) : 0;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center"
      // The ring is drawn at a fixed design size.
      style={{ width: size, height: size }}
    >
      {marks.map((mark, i) => (
        <View
          key={i}
          className="absolute items-center justify-center"
          // Each cell sits on the ring; its place is computed, not a class.
          style={{ left: (spots[i]?.x ?? 0) - cw / 2, top: (spots[i]?.y ?? 0) - ch / 2 }}
        >
          <Svg width={cw} height={ch}>
            <Polygon points={hexPoints(cw, ch)} fill={c.wax} />
          </Svg>
          <View className="absolute inset-0">
            <PopIn delay={scoreC.startAt + i * scoreC.stagger} duration={scoreC.cell}>
              <Svg width={cw} height={ch}>
                <Polygon points={hexPoints(cw, ch)} fill={c[fills[mark]]} />
                {mark === 'review' ? (
                  <Line
                    x1={cw * 0.2}
                    y1={ch * 0.3}
                    x2={cw * 0.55}
                    y2={ch * 0.6}
                    stroke={c.surf}
                    strokeWidth={1}
                    opacity={0.6}
                  />
                ) : null}
              </Svg>
            </PopIn>
          </View>
          {cw >= 18 ? (
            <Text className={`absolute font-sans-black text-2xs ${inks[mark]}`}>{i + 1}</Text>
          ) : null}
        </View>
      ))}
      <PopIn delay={end} duration={scoreC.midPop} from={scoreC.midFrom} fade={false}>
        <View className="items-center">
          <Text className="font-display-black text-2xl">
            {t('study.result.score', { correct: count, total: scored })}
          </Text>
          <Text className="font-sans-bold text-sm text-muted">
            {t('study.result.ringPercent', { percent })}
          </Text>
        </View>
      </PopIn>
    </View>
  );
}

import { View } from 'react-native';
import { cn } from '@/lib/cn';
import { useReducedMotionPref } from '@/motion';
import { CellArt } from './hex/CellArt';
import { cellMotionKind, cellTimeline } from './hex/levelChange';
import { CellMotion } from './hex/CellMotion';
import { hexCellGeometry } from './hex/geometry';
import { LevelSwap } from './hex/LevelSwap';
import { Text } from './Text';

/**
 * Mastery level of a topic as the design draws it (code names from ADR 0001 + `reinforced`):
 * empty wax, half nectar while learning, full honey when mastered, a cap when reinforced,
 * crystal when it needs practice.
 */
export type CellState =
  'not_started' | 'lesson_completed' | 'mastered' | 'reinforced' | 'needs_practice';

type HexCellProps = {
  state: CellState;
  /** Width in points; height follows the pointy-top hexagon (×1.125, as in the design). */
  size?: number;
  /** Text inside the cell, e.g. the topic number "4.3". */
  label?: string;
  /** The selected or current topic: the inverted `spot` fill with a honey label. */
  selected?: boolean;
  /**
   * The level the student saw before: the cell plays the approved change from it to `state`
   * once (fill, honey, seal or crystallize), then looks exactly as without it. Ignored when
   * there is no approved change, on selected cells, and with reduced motion.
   */
  animateFrom?: CellState;
  /** Wait before the change starts, in ms (e.g. until the panel around it has entered). */
  animationDelay?: number;
  className?: string;
};

const textClass: Record<CellState, string> = {
  not_started: 'text-lock-ink',
  lesson_completed: 'text-on-nectar',
  mastered: 'text-on-honey',
  reinforced: 'text-on-sealed',
  needs_practice: 'text-crystal-ink',
};

/** One topic cell. Decorative: the caller names the topic and its level for screen readers. */
export function HexCell({
  state,
  size = 64,
  label,
  selected = false,
  animateFrom,
  animationDelay = 0,
  className,
}: HexCellProps) {
  const reduced = useReducedMotionPref();
  const geo = hexCellGeometry(size);
  const from = animateFrom && !selected && !reduced ? animateFrom : undefined;
  const kind = from ? cellMotionKind(from, state) : null;
  const ink = selected
    ? state === 'reinforced'
      ? 'text-on-honey'
      : 'text-honey'
    : textClass[state];
  const text = (inkClass: string) => (
    <Text className={cn('font-sans-black', size < 40 ? 'text-2xs' : 'text-sm', inkClass)}>
      {label}
    </Text>
  );

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('items-center justify-center', className)}
      // Size is a prop (cells range from 11 to 92pt), so it cannot be a static className.
      style={{ width: geo.w, height: geo.h }}
    >
      {from && kind ? (
        <CellMotion
          key={`${from}-${state}`}
          geo={geo}
          kind={kind}
          from={from}
          to={state}
          delay={animationDelay}
        />
      ) : (
        <CellArt geo={geo} state={state} selected={selected} />
      )}
      {!label ? null : from && kind ? (
        <LevelSwap
          key={`${from}-${state}`}
          at={animationDelay + cellTimeline[kind].swap}
          before={text(textClass[from])}
          after={text(ink)}
        />
      ) : (
        text(ink)
      )}
    </View>
  );
}

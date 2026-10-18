import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { cn } from '@/lib/cn';
import { useThemeColors, type ColorName } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/**
 * - `ai`: AI wrote it and no teacher has checked it yet (always visible on AI text).
 * - `teacher`: a teacher approved it.
 * - `premium`: needs a premium plan; a calm lock, never a wall over core learning.
 * - `points`: points earned, e.g. "+15 bal".
 * - `soon`: content not ready yet ("Hazırlanır").
 */
export type PillKind = 'ai' | 'teacher' | 'premium' | 'points' | 'soon';

const styles: Record<PillKind, { box: string; text: string; color: ColorName; icon?: IconName }> = {
  ai: { box: 'bg-info-bg', text: 'text-info', color: 'info' },
  teacher: { box: 'bg-ok-bg', text: 'text-ok', color: 'ok', icon: 'check' },
  premium: { box: 'bg-spot', text: 'text-honey', color: 'honey', icon: 'lock' },
  points: { box: 'bg-raised', text: 'text-honey-text', color: 'honey-text', icon: 'drop' },
  soon: { box: 'bg-wax', text: 'text-lock-ink', color: 'lock-ink', icon: 'clock' },
};

type StatusPillProps = {
  kind: PillKind;
  label: string;
  className?: string;
};

/** 30pt pill with an icon; the AI pill carries a small hexagon instead. */
export function StatusPill({ kind, label, className }: StatusPillProps) {
  const s = styles[kind];
  const colors = useThemeColors();

  return (
    <View
      className={cn(
        'h-[30px] flex-row items-center gap-1.5 self-start rounded-full px-2.5',
        s.box,
        className,
      )}
    >
      {kind === 'ai' ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Svg width={14} height={16}>
            <Polygon points="7,0 14,4 14,12 7,16 0,12 0,4" fill={colors[s.color]} />
          </Svg>
        </View>
      ) : s.icon ? (
        <Icon name={s.icon} size={16} color={s.color} />
      ) : null}
      <Text className={cn('font-sans-black text-sm', s.text)}>{label}</Text>
    </View>
  );
}

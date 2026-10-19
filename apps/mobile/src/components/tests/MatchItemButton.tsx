import { Pressable, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type MatchItemButtonProps = {
  text: string;
  /** 1-based pair number; 0 when the item has no partner yet. */
  pair: number;
  picked: boolean;
  /** After checking, a left item shows whether its pair is right. */
  verdict: 'correct' | 'wrong' | null;
  disabled: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  large?: boolean;
};

// Pairs are told apart by number first and colour second: honey, info, crystal.
const pairLooks = [
  { box: 'border-honey bg-raised', badge: 'bg-honey', label: 'text-on-honey' },
  { box: 'border-info bg-info-bg', badge: 'bg-info', label: 'text-info-bg' },
  { box: 'border-crystal-ink bg-crystal', badge: 'bg-crystal-ink', label: 'text-crystal' },
];

/** One formula or expansion in the matching question. */
export function MatchItemButton({
  text,
  pair,
  picked,
  verdict,
  disabled,
  accessibilityLabel,
  onPress,
  large = false,
}: MatchItemButtonProps) {
  const look = pair > 0 ? pairLooks[(pair - 1) % pairLooks.length] : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: picked || pair > 0, disabled }}
      disabled={disabled}
      onPress={onPress}
      // The 3pt edge is always there (clear once paired), so picking never shifts the layout.
      className={cn('rounded-md pb-[3px]', picked ? 'bg-honey-deep' : !look && 'bg-border')}
    >
      <View
        className={cn(
          'min-h-16 flex-row items-center gap-2 rounded-md border-2 px-2.5 py-1.5',
          look ? look.box : picked ? 'border-honey bg-raised' : 'border-border bg-surf',
        )}
      >
        {look ? (
          <View
            className={cn('h-[22px] w-[22px] items-center justify-center rounded-full', look.badge)}
          >
            <Text className={cn('font-sans-black text-xs', look.label)}>{pair}</Text>
          </View>
        ) : (
          <View
            className={cn(
              'h-[22px] w-[22px] rounded-full border-2 border-dashed',
              picked ? 'border-honey' : 'border-border',
            )}
          />
        )}
        <Text className={cn('min-w-0 flex-1 font-sans-bold', large ? 'text-md' : 'text-base')}>
          {text}
        </Text>
        {verdict ? (
          <Icon
            name={verdict === 'correct' ? 'check' : 'x'}
            size={18}
            color={verdict === 'correct' ? 'ok' : 'err'}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

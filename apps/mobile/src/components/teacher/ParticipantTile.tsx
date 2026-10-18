import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';
import { HexBadge } from './HexBadge';

export type TileKind = 'me' | 'muted' | 'hand' | 'weak' | 'more';

const BOX: Record<TileKind, string> = {
  me: 'border-spot bg-spot',
  hand: 'border-honey bg-raised',
  weak: 'border-err bg-err-bg',
  muted: 'border-border bg-surf',
  more: 'justify-center border-wax bg-wax',
};
const BADGE: Partial<Record<TileKind, { icon: IconName; box: string; color: ColorName }>> = {
  me: { icon: 'mic', box: 'bg-honey', color: 'on-honey' },
  hand: { icon: 'hand', box: 'bg-honey', color: 'on-honey' },
  weak: { icon: 'warning', box: 'bg-err', color: 'surf' },
  muted: { icon: 'mic', box: 'bg-wax', color: 'muted' },
};

type ParticipantTileProps = { kind: TileKind; initials: string; name: string; label: string };

/** A participant: who it is and whether the mic is on, a hand is up or the line is weak. */
export function ParticipantTile({ kind, initials, name, label }: ParticipantTileProps) {
  const badge = BADGE[kind];

  return (
    <View
      accessible
      accessibilityLabel={label}
      className={cn(
        'min-h-[84px] min-w-0 flex-1 items-center gap-[3px] rounded-lg border-2 px-1 pb-1.5 pt-2',
        BOX[kind],
      )}
    >
      {kind === 'more' ? (
        <Text className="font-display-black text-md">{initials}</Text>
      ) : (
        <HexBadge size={36} tone={kind === 'me' ? 'honey' : 'wax'} label={initials} />
      )}
      <Text
        numberOfLines={1}
        className={cn(
          'max-w-full font-sans-bold text-2xs',
          kind === 'me' ? 'text-on-spot' : 'text-ink',
        )}
      >
        {name}
      </Text>
      {badge ? (
        <View
          className={cn(
            'absolute right-1 top-1 h-[20px] w-[20px] items-center justify-center rounded-full',
            badge.box,
          )}
        >
          <Icon name={badge.icon} size={13} color={badge.color} />
        </View>
      ) : null}
    </View>
  );
}

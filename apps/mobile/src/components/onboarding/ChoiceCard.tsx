import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon, type IconName, Text, useRaisedPress } from '@/components/ui';
import { cn } from '@/lib/cn';
import { HexTile } from './HexTile';

type ChoiceCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  /** The hexagon tile's content: an icon, or `tile` for text such as "AZ" or "20 dəq". */
  icon?: IconName;
  tile?: (selected: boolean) => ReactNode;
  /** A small pill beside the title ("TÖVSİYƏ"). */
  badge?: string;
  /** BCP 47 language of the card's text when it differs from the app's (language names). */
  language?: string;
  /** Overrides "title. description" when the tile carries meaning too ("10 dəq"). */
  accessibilityLabel?: string;
};

/**
 * One answer of a single-choice question: a hexagon tile, title and description, a radio dot.
 * The selected card turns warm with a honey border and edge; it sinks while pressed.
 */
export function ChoiceCard({
  title,
  description,
  selected,
  onPress,
  icon,
  tile,
  badge,
  language,
  accessibilityLabel,
}: ChoiceCardProps) {
  const press = useRaisedPress({ depth: 3 });
  return (
    <Pressable
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel ?? `${title}. ${description}`}
      accessibilityLanguage={language}
      onPress={onPress}
      className={cn('rounded-xl pb-[3px]', selected ? 'bg-honey-deep' : 'bg-border')}
    >
      <Animated.View style={press.faceStyle}>
        <View
          className={cn(
            'min-h-[72px] flex-row items-center gap-3.5 rounded-xl border-2 px-3.5 py-3',
            selected ? 'border-honey bg-raised' : 'border-border bg-surf',
          )}
        >
          <HexTile size={48} fill={selected ? 'honey' : 'raised'}>
            {tile ? (
              tile(selected)
            ) : icon ? (
              <Icon name={icon} size={24} color={selected ? 'on-honey' : 'honey-text'} />
            ) : null}
          </HexTile>
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text variant="subheading">{title}</Text>
              {badge ? (
                <View className="rounded-full bg-honey px-2 py-0.5">
                  <Text className="font-sans-black text-2xs uppercase tracking-[0.6px] text-on-honey">
                    {badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text variant="caption" tone="muted" className="font-sans">
              {description}
            </Text>
          </View>
          <View
            className={cn(
              'h-[26px] w-[26px] items-center justify-center rounded-full border-2',
              selected ? 'border-honey bg-honey' : 'border-border',
            )}
          >
            {selected ? <Icon name="check" size={16} color="on-honey" /> : null}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

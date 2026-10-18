import { Pressable, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { fontSize } from '@/theme';
import { MathText } from './MathText';

type AnswerReviewItemProps = {
  number: number;
  /** The question (formulas between $…$). */
  stem: string;
  /** "Sənin: D · Düz: C". */
  caption: string;
  accessibilityLabel: string;
  onPress: () => void;
};

/** A missed question on the result: its number, the stem and both answers; opens "Səhvlərim". */
export function AnswerReviewItem({
  number,
  stem,
  caption,
  accessibilityLabel,
  onPress,
}: AnswerReviewItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="rounded-lg bg-border pb-0.5"
    >
      {({ pressed }) => (
        <View
          className={cn(
            'min-h-16 flex-row items-center gap-2.5 rounded-lg border border-border bg-surf py-2 pl-3 pr-2.5',
            pressed && 'translate-y-0.5',
          )}
        >
          <View className="h-[30px] w-[30px] items-center justify-center rounded-xs bg-err-bg">
            <Text className="font-sans-black text-sm text-err">{number}</Text>
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <MathText text={stem} fontSize={fontSize.sm[0]} className="font-sans-bold text-sm" />
            <Text variant="caption" tone="muted" className="text-xs">
              {caption}
            </Text>
          </View>
          <Icon name="chevron" size={18} color="muted" />
        </View>
      )}
    </Pressable>
  );
}

import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Icon, Text } from '@/components/ui';
import { monthShort } from '@/features/exam/labels';
import { cn } from '@/lib/cn';
import type { DeadlineText } from '@/features/exam/deadlineText';

type DeadlineRowProps = {
  date: Date | null;
  text: DeadlineText;
  /** The date box: an assignment (info), a registration (raised), a mock (spot). */
  tone: 'info' | 'raised' | 'spot';
};

const boxes = {
  info: { box: 'bg-info-bg', ink: 'text-info' },
  raised: { box: 'bg-raised', ink: 'text-honey-text' },
  spot: { box: 'bg-spot', ink: 'text-honey' },
} as const;

/** One date: day and month in a box, what happens, and its status. Undated ones are dashed. */
export function DeadlineRow({ date, text, tone }: DeadlineRowProps) {
  const { t } = useTranslation();
  const box = boxes[tone];

  return (
    <View
      accessible
      accessibilityLabel={t('exam.deadlines.rowA11y', {
        date: date
          ? `${date.getDate()} ${monthShort(t, date.getMonth())}`
          : t('exam.deadlines.noDate'),
        title: text.title,
        body: text.body,
        tag: text.tag,
      })}
      className={cn(
        'min-h-[60px] flex-row items-center gap-3 rounded-lg border px-3 py-2',
        date ? 'border-border bg-surf' : 'border-dashed border-border',
      )}
    >
      {date ? (
        <View className={cn('h-[46px] w-[46px] items-center justify-center rounded-md', box.box)}>
          <Text className={cn('font-display-black text-md', box.ink)}>
            {String(date.getDate())}
          </Text>
          <Text className={cn('font-sans-black text-2xs', box.ink)}>
            {monthShort(t, date.getMonth())}
          </Text>
        </View>
      ) : (
        <View className="h-[46px] w-[46px] items-center justify-center rounded-md border-2 border-dashed border-border">
          <Icon name="calendar" size={20} color="muted" />
        </View>
      )}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black text-base">{text.title}</Text>
        <Text tone="muted" className="text-xs">
          {text.body}
        </Text>
      </View>
      <Badge tone={text.tagTone} label={text.tag} className="self-center" />
    </View>
  );
}

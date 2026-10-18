import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HexCell, Icon, Text } from '@/components/ui';
import { shortDate } from '@/features/study/dates';
import { reviewTimeline, type ReviewDot } from '@/features/study/review';
import { addDays } from '@/features/study/time';
import type { ReviewPlan } from '@/features/study/types';
import { cn } from '@/lib/cn';
import { HexShape } from './HexShape';

const dotLook: Record<
  ReviewDot['state'],
  { color: 'ok-bg' | 'raised' | 'wax'; key: 'dotDone' | 'dotNext' | 'dotLater' }
> = {
  done: { color: 'ok-bg', key: 'dotDone' },
  next: { color: 'raised', key: 'dotNext' },
  later: { color: 'wax', key: 'dotLater' },
};

function Column({
  children,
  title,
  caption,
  strong = false,
}: {
  children: ReactNode;
  title: string;
  caption: string;
  strong?: boolean;
}) {
  return (
    <View className="flex-1 items-center gap-1">
      {children}
      <Text className="font-sans-bold text-xs">{title}</Text>
      <Text
        className={cn(
          'text-2xs',
          strong ? 'font-sans-black text-honey-text' : 'font-sans-semibold text-muted',
        )}
      >
        {caption}
      </Text>
    </View>
  );
}

/** "Necə işləyir": one topic's way from honey through three reviews to sealed. */
export function ReviewHowCard({ plan, now = new Date() }: { plan: ReviewPlan; now?: Date }) {
  const { t } = useTranslation();
  const { example } = plan;
  const masteredAt = addDays(now, -example.masteredDaysAgo);
  const dots = reviewTimeline(masteredAt, example.intervals, example.done);

  return (
    <View className="gap-2.5 rounded-xl border border-border bg-surf p-3.5">
      <View className="gap-0.5">
        <Text variant="subheading">
          {t('study.review.how', { steps: example.intervals.join(' → ') })}
        </Text>
        <Text variant="caption" tone="muted">{`${example.code} · ${example.title}`}</Text>
      </View>
      <View className="flex-row gap-1">
        <Column title={t('study.review.honey')} caption={shortDate(t, masteredAt)}>
          <HexCell state="mastered" size={40} label={example.code} />
        </Column>
        {dots.map((dot) => {
          const look = dotLook[dot.state];
          const gap = t('study.review.gap', { count: dot.days });
          const date = shortDate(t, dot.date);
          return (
            <View
              key={dot.days}
              accessible
              accessibilityLabel={t(`study.review.${look.key}`, { gap, date })}
              className="flex-1"
            >
              <Column title={gap} caption={date} strong={dot.state === 'next'}>
                <HexShape size={40} color={look.color}>
                  {dot.state === 'done' ? <Icon name="check" size={18} color="ok" /> : null}
                  {dot.state === 'next' ? <Icon name="clock" size={18} color="honey-text" /> : null}
                </HexShape>
              </Column>
            </View>
          );
        })}
        <Column title={t('study.review.sealed')} caption={t('study.review.reinforced')}>
          <HexCell state="reinforced" size={40} label={example.code} />
        </Column>
      </View>
      <Text variant="caption" tone="muted" className="font-sans">
        {t('study.review.explainStart')}
        <Text className="font-sans-bold text-sm text-ink">{t('study.review.explainSealed')}</Text>
        {t('study.review.explainEnd')}
      </Text>
    </View>
  );
}

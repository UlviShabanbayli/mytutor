import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Text } from '@/components/ui';
import type { TeacherProfile } from '@/features/teacher/types';

const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'] as const;

type MarketPreviewProps = { profile: TeacherProfile; onEdit: () => void };

/** How the tutor-market profile will look (M8); locked until verification. */
export function MarketPreview({ profile, onEdit }: MarketPreviewProps) {
  const { t } = useTranslation();
  const l = profile.listing;
  const locked = profile.verification !== 'verified';
  const chips = [
    ...l.subjects,
    t('teacher.me.grades', {
      from: l.gradeFrom,
      to: t('common.grade', { count: l.gradeTo, ordinal: true }),
    }),
    ...l.exams.map(() => t('teacher.me.exam9')),
  ];
  const days = l.days.map((d) => t(`progress.weekDayNames.${DAY_KEYS[d] ?? '0'}`)).join(', ');

  return (
    <View
      accessibilityLabel={t('teacher.me.marketPreview')}
      className="gap-2 rounded-xl border border-border bg-surf px-3.5 py-3"
    >
      <View className="flex-row items-center gap-2">
        <Text variant="overline" tone="muted" className="flex-1">
          {t('teacher.me.market')}
        </Text>
        {locked ? (
          <View className="h-[24px] flex-row items-center gap-1 rounded-full bg-wax px-2">
            <Icon name="lock" size={13} color="lock-ink" />
            <Text className="font-sans-black text-2xs text-lock-ink">
              {t('teacher.me.marketLocked')}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="flex-row items-baseline gap-1.5">
        <Text className="font-display-black text-lg">
          {l.pricePerHour === null
            ? t('teacher.me.noPrice')
            : t('teacher.me.price', { price: l.pricePerHour })}
        </Text>
        <Text className="font-sans-bold text-sm text-muted">{t('teacher.me.perHour')}</Text>
      </View>
      <View className="flex-row flex-wrap gap-1.5">
        {chips.map((c) => (
          <View key={c} className="h-[26px] justify-center rounded-[8px] bg-raised px-2">
            <Text className="font-sans-black text-xs text-honey-text">{c}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row items-center gap-1.5">
        <Icon name="calendar" size={16} color="muted" />
        <Text className="font-sans-semibold text-sm">
          {t('teacher.me.schedule', { days, hours: l.hours })}
        </Text>
      </View>
      <Text variant="caption" tone="muted" className="font-sans">
        {l.bio}
      </Text>
      {l.reviewCount === 0 ? (
        <View
          accessibilityRole="text"
          className="flex-row items-center gap-2 rounded-md bg-page px-2.5 py-2"
        >
          <Icon name="star" size={18} color="lock-ink" />
          <Text variant="caption" tone="muted" className="flex-1 font-sans">
            {t('teacher.me.noReviews')}
          </Text>
        </View>
      ) : null}
      <Button variant="secondary" size="md" label={t('teacher.me.editProfile')} onPress={onEdit} />
    </View>
  );
}

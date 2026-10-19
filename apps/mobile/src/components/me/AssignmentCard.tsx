import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Text } from '@/components/ui';
import { formatWhen } from '@/features/me/format';
import type { ClassAssignment } from '@/features/me/types';
import { cn } from '@/lib/cn';
import { Hex } from './Hex';

const statusClasses = {
  not_started: { box: 'bg-wax', text: 'text-lock-ink' },
  submitted: { box: 'bg-info-bg', text: 'text-info' },
  checked: { box: 'bg-ok-bg', text: 'text-ok' },
} as const;

type AssignmentCardProps = { item: ClassAssignment };

/** A class task with its deadline and status; a test starts, a homework opens its page. */
export function AssignmentCard({ item }: AssignmentCardProps) {
  const { t } = useTranslation();
  const due = formatWhen(t, item.due);
  const status =
    item.status === 'checked' && item.grade
      ? `${t('me.classPage.status.checked')} · ${t('me.classPage.score', item.grade)}`
      : t(`me.classPage.status.${item.status}`);
  const startTest = item.kind === 'test' && item.status === 'not_started' && item.testId;
  const s = statusClasses[item.status];

  return (
    <View
      accessibilityLabel={t('me.classPage.assignmentLabel', { title: item.title, due, status })}
      className="gap-2 rounded-[18px] border border-border bg-surf px-3.5 py-3"
    >
      <View className="flex-row items-center gap-3">
        <Hex width={40} fill="honey">
          <Text className="font-sans-black text-xs text-on-honey">{item.topic}</Text>
        </Hex>
        <View className="flex-1 gap-0.5">
          <Text variant="overline" tone="muted">
            {item.kind === 'test'
              ? t('me.classPage.testOverline', { count: item.questions ?? 0 })
              : t('me.classPage.homeworkOverline')}
          </Text>
          <Text className="font-sans-black text-sm">{item.title}</Text>
        </View>
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        <View className="h-[26px] flex-row items-center gap-1 rounded-full bg-raised px-2">
          <Icon name="clock" size={14} color="honey-text" />
          <Text className="font-sans-black text-xs text-honey-text">{due}</Text>
        </View>
        <View className={cn('h-[26px] justify-center rounded-full px-2', s.box)}>
          <Text className={cn('font-sans-black text-xs', s.text)}>{status}</Text>
        </View>
        <View className="flex-1" />
        <Button
          size="md"
          variant={startTest ? 'primary' : 'secondary'}
          label={startTest ? t('me.classPage.start') : t('me.classPage.open')}
          onPress={() =>
            startTest
              ? router.push({ pathname: '/test/[id]', params: { id: startTest } })
              : router.push({ pathname: '/assignment/[id]', params: { id: item.id } })
          }
        />
      </View>
    </View>
  );
}

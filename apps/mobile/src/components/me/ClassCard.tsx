import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, PressableCard, Text } from '@/components/ui';
import { formatWhen } from '@/features/me/format';
import type { ClassSummary } from '@/features/me/types';
import type { ColorName } from '@/theme';
import { Hex } from './Hex';

type ClassCardProps = { item: ClassSummary };

/** A class in "Siniflərim": teacher, unread count, the next task, live lesson, chat and jar. */
export function ClassCard({ item }: ClassCardProps) {
  const { t } = useTranslation();
  const students = t('me.shared.studentsCount', { count: item.students });
  const lines: { icon: IconName; color: ColorName; text: string }[] = [
    {
      icon: 'video',
      color: 'info',
      text: t('me.classes.live', { when: formatWhen(t, item.nextLive) }),
    },
    {
      icon: 'chat',
      color: 'info',
      text: `${t('me.classes.newMessages', { count: item.newMessages })} · ${t(
        'me.classes.newAnnouncements',
        { count: item.newAnnouncements },
      )}`,
    },
    {
      icon: 'learn',
      color: 'honey-text',
      text: t('me.classes.jar', { percent: item.jar.percent }),
    },
  ];

  return (
    <PressableCard
      accessibilityLabel={t('me.classes.cardLabel', {
        name: item.name,
        teacher: item.teacher,
        count: item.unread,
      })}
      onPress={() => router.push({ pathname: '/class/[id]', params: { id: item.id } })}
      contentClassName="gap-3 p-3.5"
    >
      <View className="flex-row items-center gap-3">
        <Hex width={48} fill="honey">
          <Text className="font-display-black text-base text-on-honey">{item.short}</Text>
        </Hex>
        <View className="flex-1 gap-0.5">
          <Text className="font-sans-black text-md">{item.name}</Text>
          <Text tone="muted" className="text-sm">
            {t('me.classes.meta', { teacher: item.teacher, students })}
          </Text>
        </View>
        {item.unread > 0 ? (
          <View className="h-6 min-w-6 items-center justify-center rounded-full bg-err px-1.5">
            <Text className="font-sans-black text-sm text-page">{item.unread}</Text>
          </View>
        ) : null}
      </View>
      <View className="flex-row items-center gap-2.5 rounded-md bg-raised px-3 py-2.5">
        <Icon name="file" size={20} color="honey-text" />
        <View className="flex-1 gap-px">
          <Text variant="overline" tone="muted">
            {t('me.classes.next')}
          </Text>
          <Text className="font-sans-black text-sm">{item.nextAssignment.title}</Text>
        </View>
        <View className="rounded-full bg-surf px-2 py-[5px]">
          <Text className="font-sans-black text-xs text-honey-text">
            {formatWhen(t, item.nextAssignment.due)}
          </Text>
        </View>
      </View>
      <View className="gap-2">
        {lines.map((l) => (
          <View key={l.icon} className="flex-row items-center gap-2">
            <Icon name={l.icon} size={18} color={l.color} />
            <Text tone="muted" className="flex-1 text-sm">
              {l.text}
            </Text>
          </View>
        ))}
      </View>
    </PressableCard>
  );
}

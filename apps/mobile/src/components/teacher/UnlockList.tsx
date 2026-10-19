import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

type UnlockListProps = { unlocked: boolean };

/** What verification opens (M1): paid classes, the tutor market, the shared question queue. */
export function UnlockList({ unlocked }: UnlockListProps) {
  const { t } = useTranslation();
  const items = [
    [t('teacher.verify.paidTitle'), t('teacher.verify.paidBody')],
    [t('teacher.verify.marketTitle'), t('teacher.verify.marketBody')],
    [t('teacher.verify.queueTitle'), t('teacher.verify.queueBody')],
  ];

  return (
    <View className="gap-0.5 rounded-xl border border-border bg-surf px-3.5 py-2.5">
      <Text variant="overline" tone="muted" accessibilityRole="header" className="pb-1">
        {unlocked ? t('teacher.verify.unlocked') : t('teacher.verify.unlocks')}
      </Text>
      {items.map(([title, body]) => (
        <View key={title} accessible className="min-h-[36px] flex-row items-center gap-2.5">
          <Icon name={unlocked ? 'check' : 'lock'} size={18} color={unlocked ? 'ok' : 'lock-ink'} />
          <Text className="min-w-0 flex-1 font-sans-bold text-sm">
            {title}
            <Text className="font-sans-semibold text-sm text-muted">{` · ${body}`}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

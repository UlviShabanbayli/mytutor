import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { SectionLabel } from './SectionLabel';

type ConsentSeeCardProps = { name: string };

/** What the parent sees from the start, what never, and that the child cannot stop it alone. */
export function ConsentSeeCard({ name }: ConsentSeeCardProps) {
  const { t } = useTranslation();
  const items = [
    t('parent.consent.seeReport'),
    t('parent.consent.seeProgress'),
    t('parent.consent.seeAssignments'),
  ];

  return (
    <View className="gap-2 rounded-[18px] border border-border bg-surf px-3.5 py-3">
      <SectionLabel>{t('parent.consent.seeTitle')}</SectionLabel>
      <View accessibilityRole="list" className="gap-2">
        {items.map((item) => (
          <View key={item} className="flex-row items-center gap-2">
            <Icon name="check" size={18} color="ok" />
            <Text className="min-w-0 flex-1 font-sans-semibold text-sm">{item}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row items-start gap-2 border-t border-border pt-1.5">
        <Icon name="lock" size={16} color="lock-ink" />
        <Text className="min-w-0 flex-1 text-sm text-lock-ink">{t('parent.consent.never')}</Text>
      </View>
      <View className="flex-row items-start gap-2">
        <Icon name="link" size={16} color="muted" />
        <Text className="min-w-0 flex-1 text-sm text-muted">
          {t('parent.consent.cannotStop', { name })}
        </Text>
      </View>
    </View>
  );
}

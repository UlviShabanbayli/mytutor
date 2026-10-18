import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Icon, Text } from '@/components/ui';

/** "Kodu harada tapsın?": the path in the child's app, Mən → Valideyn → Kod yarat. */
export function CodeWhereCard() {
  const { t } = useTranslation();
  const steps = [t('parent.code.pathMe'), t('parent.code.pathParent'), t('parent.code.pathCreate')];

  return (
    <Card className="gap-2.5 p-3.5">
      <View className="flex-row items-center gap-2.5">
        <View className="h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-raised">
          <Icon name="phone" size={22} color="honey-text" />
        </View>
        <Text accessibilityRole="header" className="min-w-0 flex-1 font-sans-black">
          {t('parent.code.whereTitle')}
        </Text>
      </View>
      <View
        accessible
        accessibilityLabel={t('parent.code.pathLabel')}
        className="flex-row flex-wrap items-center gap-1"
      >
        {steps.map((step, i) => (
          <View key={step} className="flex-row items-center gap-1">
            {i > 0 ? <Icon name="chevron" size={16} color="muted" /> : null}
            <View className="h-[32px] flex-row items-center gap-1 rounded-sm bg-raised px-2.5">
              {i === 0 ? <Icon name="me" size={16} color="honey-text" /> : null}
              <Text className="font-sans-black text-sm text-honey-text">{step}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text variant="caption" tone="muted" className="font-sans">
        {t('parent.code.whereBody')}
      </Text>
    </Card>
  );
}

import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, HexCell, Text } from '@/components/ui';

/** "Necə bağlanırıq?": the three steps of linking, each with a numbered honey cell. */
export function HowToLinkCard() {
  const { t } = useTranslation();
  const steps = [
    { n: '1', title: t('parent.kids.step1Title'), body: t('parent.kids.step1Body') },
    { n: '2', title: t('parent.kids.step2Title'), body: t('parent.kids.step2Body') },
    { n: '3', title: t('parent.kids.step3Title'), body: t('parent.kids.step3Body') },
  ];

  return (
    <Card className="gap-3 p-3.5">
      <Text variant="heading" className="text-md">
        {t('parent.kids.howTitle')}
      </Text>
      <View accessibilityRole="list" className="gap-3">
        {steps.map((step) => (
          <View
            key={step.n}
            accessible
            accessibilityLabel={`${step.n}. ${step.title}. ${step.body}`}
            className="flex-row items-start gap-3"
          >
            <HexCell state="mastered" size={34} label={step.n} />
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="font-sans-black">{step.title}</Text>
              <Text variant="caption" tone="muted" className="font-sans">
                {step.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

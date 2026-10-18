import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Icon, Text } from '@/components/ui';
import { genitiveAz } from '@/features/parent/text';

type PremiumCardProps = { childName: string };

/**
 * A parent may pay for the child's Premium (P4); paying never shows the parent more. Payments
 * are not built yet, so the card says "Tezliklə" instead of a pay button.
 */
export function PremiumCard({ childName }: PremiumCardProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-2 rounded-[18px] bg-spot px-3.5 py-3">
      <View className="flex-row items-center gap-2.5">
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="font-sans-black text-2xs uppercase tracking-[0.9px] text-honey">
            {t('parent.me.premiumLabel')}
          </Text>
          <Text className="font-sans-black text-md text-on-spot">
            {t('parent.me.premiumTitle', { name: childName })}
          </Text>
          <Text className="text-sm text-on-spot opacity-85">{t('parent.me.premiumPrice')}</Text>
        </View>
        <Badge tone="honey" icon="clock" label={t('parent.me.premiumSoon')} />
      </View>
      <View className="flex-row items-start gap-1.5">
        <View className="pt-px opacity-85">
          <Icon name="info" size={14} color="on-spot" />
        </View>
        <Text className="min-w-0 flex-1 text-xs text-on-spot opacity-85">
          {t('parent.me.premiumNote', { name: childName, nameGen: genitiveAz(childName) })}
        </Text>
      </View>
    </View>
  );
}

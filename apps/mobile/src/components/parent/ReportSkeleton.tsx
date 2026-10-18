import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Text } from '@/components/ui';

/** The report's shape in wax while the week is gathered (design "yüklənir"). */
export function ReportSkeleton() {
  const { t } = useTranslation();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('parent.report.loading')}
      className="gap-2.5"
    >
      <View className="h-[92px] rounded-[18px] bg-wax" />
      <View className="flex-row gap-2.5">
        <View className="h-[92px] flex-1 rounded-[18px] bg-wax opacity-85" />
        <View className="h-[92px] flex-1 rounded-[18px] bg-wax opacity-85" />
      </View>
      <View className="flex-row items-center gap-2.5 px-0.5 py-1.5">
        <Mascot mood="ucur" size={56} decorative />
        <Text className="font-sans-bold text-muted">{t('parent.report.loading')}</Text>
      </View>
      <View className="h-[84px] rounded-[18px] bg-wax opacity-70" />
      <View className="h-[96px] rounded-[18px] bg-wax opacity-55" />
      <View className="h-[110px] rounded-[18px] bg-wax opacity-40" />
    </View>
  );
}

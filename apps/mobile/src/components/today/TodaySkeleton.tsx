import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';

/** The plan's shape in wax while it loads, with Vızı flying in. */
export function TodaySkeleton() {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('today.loading')}
      aria-busy
      className="gap-3"
    >
      <View className="h-[118px] rounded-xl bg-wax" />
      <View className="h-[104px] rounded-xl bg-wax opacity-80" />
      <View className="flex-row items-center gap-2.5 px-0.5 py-1">
        <Mascot moment="loading" size={56} decorative />
        <Text className="font-sans-bold text-muted">{t('today.loading')}</Text>
      </View>
      <View className="h-16 rounded-lg bg-wax opacity-70" />
      <View className="h-16 rounded-lg bg-wax opacity-55" />
      <View className="h-16 rounded-lg bg-wax opacity-40" />
    </View>
  );
}

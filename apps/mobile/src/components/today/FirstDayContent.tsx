import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { TodayData } from '@/features/today/types';
import { FirstStepCard } from './FirstStepCard';
import { GuestAccountCard } from './GuestAccountCard';

type FirstDayContentProps = {
  today: TodayData;
};

/** Below the goal card on the first day: where to start, the guest note, all subjects. */
export function FirstDayContent({ today }: FirstDayContentProps) {
  const { t } = useTranslation();

  return (
    <>
      <FirstStepCard step={today.firstStep} />
      <GuestAccountCard />
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/learn')}
        className="min-h-touch flex-row items-center justify-center gap-1.5 active:opacity-70"
      >
        <Text className="font-sans-black text-honey-text">{t('today.firstDay.allSubjects')}</Text>
        <Icon name="chevron" size={18} color="honey-text" />
      </Pressable>
    </>
  );
}

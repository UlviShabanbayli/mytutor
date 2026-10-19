import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type MinutesTileProps = {
  minutes: number;
  selected: boolean;
};

/** "20 / dəq" stacked inside a choice card's hexagon. */
export function MinutesTile({ minutes, selected }: MinutesTileProps) {
  const { t } = useTranslation();
  const tone = selected ? 'text-on-honey' : 'text-honey-text';

  return (
    <>
      <Text className={cn('font-display-black text-md leading-[18px]', tone)}>
        {String(minutes)}
      </Text>
      <Text className={cn('font-sans-black text-2xs leading-[12px]', tone)}>
        {t('onboarding.time.unit')}
      </Text>
    </>
  );
}

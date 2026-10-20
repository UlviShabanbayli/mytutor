import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { useExamCountdown } from '@/features/onboarding/queries';
import type { ExamOption } from '@/features/onboarding/types';
import { HexTile } from './HexTile';

type ExamCountdownCardProps = {
  option: ExamOption;
};

/** The inverted card with days left until the chosen exam; always marked as an estimate. */
export function ExamCountdownCard({ option }: ExamCountdownCardProps) {
  const { t } = useTranslation();
  const countdown = useExamCountdown(option);
  const kind =
    option.exam === 'admission'
      ? t('onboarding.exam.countdown.kind.admission', { group: option.group })
      : t(`onboarding.exam.countdown.kind.${option.exam}`);

  return (
    <View className="flex-row items-center gap-3.5 rounded-xl bg-spot px-4 py-3.5">
      <HexTile size={52} fill="honey">
        <Icon name="calendar" size={24} color="on-honey" />
      </HexTile>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="overline" tone="honey" className="text-xs">
          {kind}
        </Text>
        {countdown.isError ? (
          <Text variant="caption" tone="inverse">
            {t('onboarding.exam.countdown.error')}
          </Text>
        ) : (
          <>
            <Text tone="inverse" className="font-display-black text-xl">
              {countdown.data
                ? t('onboarding.exam.countdown.days', { count: countdown.data.daysLeft })
                : t('common.loading')}
            </Text>
            <Text variant="caption" tone="inverse" className="font-sans opacity-80">
              {t('onboarding.exam.countdown.estimate')}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

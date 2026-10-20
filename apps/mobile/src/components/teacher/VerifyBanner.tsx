import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { TeacherVerification } from '@mytutor/types';
import { SmallButton } from './SmallButton';

type VerifyBannerProps = { status: TeacherVerification };

/** M1: free classes work at once; this says what verification adds (hidden once verified). */
export function VerifyBanner({ status }: VerifyBannerProps) {
  const { t } = useTranslation();
  if (status === 'verified') return null;
  const pending = status === 'pending';

  return (
    <View
      accessibilityRole="summary"
      className="flex-row items-center gap-3 rounded-[18px] bg-info-bg p-3"
    >
      <View className="h-[40px] w-[40px] items-center justify-center rounded-md bg-surf">
        <Icon name={pending ? 'clock' : 'shield'} size={22} color="info" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black text-sm text-info">
          {pending ? t('teacher.classes.verifyPendingTitle') : t('teacher.classes.verifyTitle')}
        </Text>
        <Text variant="caption" className="font-sans text-ink">
          {pending ? t('teacher.classes.verifyPendingBody') : t('teacher.classes.verifyBody')}
        </Text>
      </View>
      <SmallButton
        variant="info"
        label={
          pending ? t('teacher.classes.verifyPendingAction') : t('teacher.classes.verifyAction')
        }
        onPress={() => router.push('/teacher/verify')}
        className="self-center"
      />
    </View>
  );
}

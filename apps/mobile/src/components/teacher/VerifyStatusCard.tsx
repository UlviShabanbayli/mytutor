import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Icon, Text } from '@/components/ui';
import type { TeacherVerification } from '@mytutor/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';

type VerifyStatusCardProps = { status: TeacherVerification; submittedAt: string | null };

/** Where the verification stands, with Vızı thinking it over. */
export function VerifyStatusCard({ status, submittedAt }: VerifyStatusCardProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const text =
    status === 'pending'
      ? {
          title: t('teacher.verify.pendingTitle'),
          body: submittedAt
            ? t('teacher.verify.pendingBody', f.dateIn(new Date(submittedAt)))
            : t('teacher.classes.verifyPendingBody'),
        }
      : status === 'verified'
        ? { title: t('teacher.verify.verifiedTitle'), body: t('teacher.verify.verifiedBody') }
        : { title: t('teacher.verify.startTitle'), body: t('teacher.verify.startBody') };

  return (
    <View
      accessibilityRole="summary"
      className="flex-row items-center gap-1.5 rounded-xl bg-raised py-2.5 pl-1.5 pr-3.5"
    >
      <Mascot moment={status === 'verified' ? 'correct' : 'aiThinking'} size={64} decorative />
      <View className="min-w-0 flex-1 gap-[3px]">
        <View className="flex-row items-center gap-1.5">
          <Icon name={status === 'verified' ? 'check' : 'clock'} size={18} color="honey-text" />
          <Text className="flex-1 font-sans-black text-base text-honey-text">{text.title}</Text>
        </View>
        <Text variant="caption" className="font-sans text-ink">
          {text.body}
        </Text>
      </View>
    </View>
  );
}

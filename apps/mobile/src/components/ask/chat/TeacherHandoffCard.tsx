import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components/ui';
import { ANSWER_MINUTES } from '@/features/ask/demo';
import { initials } from '@/features/ask/labels';
import type { AskUsage } from '@/features/ask/types';

type TeacherHandoffCardProps = {
  usage: AskUsage | undefined;
  onSend: () => void;
};

/** When Vızı is not sure: send the question to the class teacher through Soruş (Ş8). */
export function TeacherHandoffCard({ usage, onSend }: TeacherHandoffCardProps) {
  const { t } = useTranslation();
  const teacher = t('ask.demo.teacherShort');

  return (
    <View
      accessibilityLabel={t('ask.chat.handoffA11y')}
      className="gap-2.5 rounded-xl border-2 border-honey bg-raised p-3.5"
    >
      <View className="flex-row items-center gap-2.5">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-honey">
          <Text className="font-sans-black text-sm text-on-honey">
            {initials(t('ask.demo.teacherFull'))}
          </Text>
        </View>
        <View className="min-w-0 flex-1 gap-px">
          <Text className="font-sans-black">{t('ask.chat.handoffTitle', { teacher })}</Text>
          <Text variant="caption" tone="muted" className="font-sans">
            {t('ask.chat.handoffHint', { minutes: ANSWER_MINUTES.teacher })}
          </Text>
        </View>
      </View>
      <Text variant="caption" className="font-sans leading-5">
        {t('ask.chat.handoffBody')}
      </Text>
      <Button label={t('ask.chat.handoffAction')} icon="camera" onPress={onSend} />
      {usage ? (
        <Text variant="caption" tone="muted" className="text-center text-xs">
          {t('ask.chat.photoUsage', { used: usage.photoUsed, limit: usage.photoLimit })}
        </Text>
      ) : null}
    </View>
  );
}

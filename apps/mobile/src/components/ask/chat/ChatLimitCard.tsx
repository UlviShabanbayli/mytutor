import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusPill, Text } from '@/components/ui';
import { CHAT_TOPIC } from '@/features/ask/chatTopic';
import { photosLeft } from '@/features/ask/questions';
import type { AskUsage } from '@/features/ask/types';
import { SpotOutlineButton } from '../SpotOutlineButton';

type ChatLimitCardProps = {
  usage: AskUsage;
};

/** Today's Vızı messages are used up: calm premium note and ways to keep learning. */
export function ChatLimitCard({ usage }: ChatLimitCardProps) {
  const { t } = useTranslation();
  const left = photosLeft(usage);

  return (
    <View accessibilityLabel={t('ask.chat.limitA11y')} className="gap-2.5 rounded-xl bg-spot p-4">
      <StatusPill kind="premium" label={t('ask.home.premium')} className="bg-spot-line" />
      <Text className="font-display-bold text-lg leading-6 text-on-spot">
        {t('ask.chat.limitTitle')}
      </Text>
      <Text className="text-on-spot/85">{t('ask.chat.limitBody')}</Text>
      {left > 0 ? (
        <SpotOutlineButton
          label={t('ask.chat.limitPhoto')}
          icon="camera"
          trailing={t('ask.chat.limitPhotoLeft', { count: left })}
          align="start"
          onPress={() => router.push('/ask/camera')}
        />
      ) : null}
      <SpotOutlineButton
        label={t('ask.chat.limitLesson', { topic: CHAT_TOPIC.number })}
        icon="play"
        trailing={t('ask.chat.limitLessonMinutes', { minutes: CHAT_TOPIC.minutes })}
        align="start"
        onPress={() =>
          router.push({
            pathname: '/lesson/[id]',
            params: { id: CHAT_TOPIC.id },
          })
        }
      />
      <SpotOutlineButton
        label={t('ask.chat.limitPremium')}
        icon="info"
        variant="link"
        onPress={() => router.push('/me/subscription')}
      />
    </View>
  );
}

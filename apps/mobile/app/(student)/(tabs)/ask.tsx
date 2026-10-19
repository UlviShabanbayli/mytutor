import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AskCameraCard } from '@/components/ask/AskCameraCard';
import { AskOfflineBanner } from '@/components/ask/AskOfflineBanner';
import { AskViziCard } from '@/components/ask/AskViziCard';
import { PhotoLimitRow } from '@/components/ask/PhotoLimitRow';
import { RecentQuestions } from '@/components/ask/RecentQuestions';
import { Screen, Text } from '@/components/ui';
import { useAskQuestions, useAskUsage } from '@/features/ask/queries';
import { useOnline } from '@/features/ask/useOnline';

/** Soruş tab: photograph a question for a teacher, or ask Vızı; the latest questions below. */
export default function AskScreen() {
  const { t } = useTranslation();
  const online = useOnline();
  const questions = useAskQuestions();
  const { usage } = useAskUsage();

  return (
    <Screen className="gap-3">
      <View className="gap-0.5">
        <Text variant="overline" tone="muted" className="text-xs">
          {t('ask.home.overline')}
        </Text>
        <Text variant="title">{t('ask.home.title')}</Text>
      </View>
      {online ? null : <AskOfflineBanner />}
      <AskCameraCard online={online} />
      <AskViziCard online={online} />
      {online && usage ? <PhotoLimitRow usage={usage} /> : null}
      <RecentQuestions
        questions={questions.data}
        isPending={questions.isPending}
        isError={questions.isError}
        onRetry={() => void questions.refetch()}
      />
    </Screen>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AskAnswerView } from '@/components/ask/AskAnswerView';
import { AskStatusView } from '@/components/ask/AskStatusView';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/ui';
import { useAskQuestion } from '@/features/ask/queries';

/** One photo question: its status while on the way, the approved answer once a teacher is done. */
export default function AskQuestionScreen() {
  const { t } = useTranslation();
  // `sent` is set by the send screen, so the status opens with "Sualın göndərildi".
  const { id, sent } = useLocalSearchParams<{ id: string; sent?: string }>();
  const query = useAskQuestion(id);

  if (query.isPending)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  if (query.isError)
    return (
      <Screen>
        <ScreenHeader title={t('ask.status.title')} />
        <ErrorState onRetry={() => void query.refetch()} />
      </Screen>
    );

  const { question } = query;
  if (!question)
    return (
      <Screen>
        <ScreenHeader title={t('ask.status.title')} />
        <EmptyState
          moment="aiThinking"
          title={t('ask.status.notFoundTitle')}
          description={t('ask.status.notFoundBody')}
          actionLabel={t('ask.status.backToAsk')}
          onAction={() => router.navigate('/ask')}
        />
      </Screen>
    );

  return question.status === 'answered' && question.answer ? (
    <AskAnswerView question={question} answer={question.answer} />
  ) : (
    <AskStatusView question={question} justSent={sent === '1'} />
  );
}

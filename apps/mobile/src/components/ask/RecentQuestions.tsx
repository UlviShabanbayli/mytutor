import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Banner, Icon, StaggerGroup, StaggerItem, Text } from '@/components/ui';
import { relativeDay } from '@/features/ask/dates';
import { questionNote } from '@/features/ask/labels';
import type { AskQuestion } from '@/features/ask/types';
import { QuestionRow } from './QuestionRow';

type RecentQuestionsProps = {
  questions: AskQuestion[] | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
};

const RECENT_COUNT = 3;

/** "Suallarım" on the Ask tab: the last three questions and a link to all of them. */
export function RecentQuestions({ questions, isPending, isError, onRetry }: RecentQuestionsProps) {
  const { t } = useTranslation();
  const now = new Date();

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text variant="heading">{t('ask.home.mineTitle')}</Text>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('ask.home.seeAllA11y')}
          onPress={() => router.push('/ask/mine')}
          className="min-h-touch flex-row items-center gap-0.5 pl-2.5"
        >
          <Text className="font-sans-black text-honey-text">{t('ask.home.seeAll')}</Text>
          <Icon name="chevron" size={18} color="honey-text" />
        </Pressable>
      </View>

      {isPending ? (
        <View accessibilityElementsHidden className="gap-2">
          {Array.from({ length: RECENT_COUNT }, (_, i) => (
            <View key={i} className="h-[70px] rounded-lg bg-wax" />
          ))}
        </View>
      ) : isError ? (
        <Banner
          kind="error"
          message={t('ask.home.mineError')}
          actionLabel={t('common.retry')}
          onAction={onRetry}
        />
      ) : !questions || questions.length === 0 ? (
        <Text tone="muted">{t('ask.home.mineEmpty')}</Text>
      ) : (
        <StaggerGroup>
          {questions.slice(0, RECENT_COUNT).map((q, i) => (
            <StaggerItem key={q.id} index={i}>
              <QuestionRow
                question={q}
                meta={relativeDay(t, new Date(q.sentAt), now)}
                note={q.status === 'queued' ? questionNote(t, q) : undefined}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </View>
  );
}

import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Banner,
  Icon,
  SkeletonBlock,
  SkeletonSwap,
  StaggerGroup,
  StaggerItem,
  Text,
} from '@/components/ui';
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
/** Heights of the three latest rows as they usually are (a title wraps to two lines). */
const SKELETON_ROWS = ['h-[96px]', 'h-[96px]', 'h-[76px]'];

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

      {isError ? (
        <Banner
          kind="error"
          message={t('ask.home.mineError')}
          actionLabel={t('common.retry')}
          onAction={onRetry}
        />
      ) : !isPending && (!questions || questions.length === 0) ? (
        <Text tone="muted">{t('ask.home.mineEmpty')}</Text>
      ) : (
        // transitions.skeleton C: the rows' skeleton cross-fades into them when they arrive.
        <SkeletonSwap
          pending={isPending}
          className="gap-2"
          skeleton={SKELETON_ROWS.map((height, i) => (
            <SkeletonBlock key={i} className={`${height} rounded-lg`} />
          ))}
        >
          <StaggerGroup>
            {(questions ?? []).slice(0, RECENT_COUNT).map((q, i) => (
              <StaggerItem key={q.id} index={i}>
                <QuestionRow
                  question={q}
                  meta={relativeDay(t, new Date(q.sentAt), now)}
                  note={q.status === 'queued' ? questionNote(t, q) : undefined}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </SkeletonSwap>
      )}
    </View>
  );
}

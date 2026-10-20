import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  LoadingState,
  ScreenHeader,
  SegmentedControl,
  Text,
} from '@/components/ui';
import { groupThousands } from '@/features/exam/format';
import { mockTitle } from '@/features/exam/labels';
import { useLeaderboard } from '@/features/exam/queries';
import { useExamStore } from '@/features/exam/store';
import type { LeaderboardScope } from '@/features/exam/types';
import { useClasses, useNickname } from '@/features/me/queries';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardRow } from './LeaderboardRow';
import { LeaderboardSettingsSheet } from './LeaderboardSettingsSheet';

/** The general mock's leaderboard: opt-in, class or country, nicknames only. */
export function LeaderboardView() {
  const { t } = useTranslation();
  const [scope, setScope] = useState<LeaderboardScope>('country');
  const [settings, setSettings] = useState(false);
  const optIn = useExamStore((s) => s.leaderboardOptIn);
  const setOptIn = useExamStore((s) => s.setLeaderboardOptIn);
  const nickname = useNickname();
  const myClass = useClasses().data?.[0];
  const query = useLeaderboard(scope);
  const board = query.data?.board ?? null;
  const mock = query.data?.mock ?? null;

  const subtitle =
    board && mock
      ? t('exam.board.subtitle', {
          mock: mockTitle(t, mock),
          participants: t('exam.board.participants', {
            count: board.participants,
            formatted: groupThousands(board.participants),
          }),
        })
      : undefined;
  const header = (
    <ScreenHeader
      title={t('exam.board.title')}
      subtitle={optIn ? subtitle : undefined}
      actions={
        optIn ? (
          <IconButton
            icon="settings"
            accessibilityLabel={t('exam.board.settings')}
            onPress={() => setSettings(true)}
          />
        ) : undefined
      }
    />
  );

  if (!optIn)
    return (
      <View className="flex-1 gap-3">
        {header}
        <EmptyState
          moment="reward"
          title={t('exam.board.optInTitle')}
          description={`${t('exam.board.optInBody', { nick: nickname })} ${t('exam.board.optInNote')}`}
          actionLabel={t('exam.board.optInCta')}
          onAction={() => setOptIn(true)}
        />
      </View>
    );

  return (
    <View className="flex-1 gap-2.5">
      {header}
      <SegmentedControl
        accessibilityLabel={t('exam.board.scopeA11y')}
        segments={[
          ...(myClass
            ? [
                {
                  value: 'class' as const,
                  label: t('exam.board.scopeClass', { name: myClass.short }),
                },
              ]
            : []),
          { value: 'country' as const, label: t('exam.board.scopeCountry') },
        ]}
        value={scope}
        onChange={setScope}
      />
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : board === null ? (
        <EmptyState
          moment="reward"
          title={t('exam.board.emptyTitle')}
          description={t('exam.board.emptyBody')}
        />
      ) : (
        <>
          <ScrollView className="flex-1" contentContainerClassName="pb-2">
            <LeaderboardList board={board} />
          </ScrollView>
          <View className="gap-2 border-t border-border pt-2">
            <LeaderboardRow
              entry={board.you}
              you
              note={t('exam.board.youTop', { percent: board.you.topPercent })}
            />
            <View className="flex-row items-center justify-center gap-1.5">
              <Icon name="shield" size={16} color="muted" />
              <Text tone="muted" className="font-sans-semibold text-xs">
                {t('exam.board.privacy')}
              </Text>
            </View>
          </View>
        </>
      )}
      <LeaderboardSettingsSheet
        visible={settings}
        nick={nickname}
        onClose={() => setSettings(false)}
        onLeave={() => {
          setSettings(false);
          setOptIn(false);
        }}
      />
    </View>
  );
}

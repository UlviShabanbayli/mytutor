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
import { DEMO_CLASS, DEMO_NICKNAME } from '@/features/exam/demo';
import { groupThousands } from '@/features/exam/format';
import { mockTitle } from '@/features/exam/labels';
import { useLeaderboard } from '@/features/exam/queries';
import { useExamStore } from '@/features/exam/store';
import type { LeaderboardScope } from '@/features/exam/types';
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
  const query = useLeaderboard(scope);

  const subtitle = query.data
    ? t('exam.board.subtitle', {
        mock: mockTitle(t, { kind: 'scheduled', ...query.data.mock }),
        participants: t('exam.board.participants', {
          count: query.data.board.participants,
          formatted: groupThousands(query.data.board.participants),
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
          description={`${t('exam.board.optInBody', { nick: DEMO_NICKNAME })} ${t('exam.board.optInNote')}`}
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
          { value: 'class', label: t('exam.board.scopeClass', { name: DEMO_CLASS }) },
          { value: 'country', label: t('exam.board.scopeCountry') },
        ]}
        value={scope}
        onChange={setScope}
      />
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <>
          <ScrollView className="flex-1" contentContainerClassName="pb-2">
            <LeaderboardList board={query.data.board} />
          </ScrollView>
          <View className="gap-2 border-t border-border pt-2">
            <LeaderboardRow
              entry={query.data.board.you}
              you
              note={t('exam.board.youTop', { percent: query.data.board.you.topPercent })}
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
        nick={DEMO_NICKNAME}
        onClose={() => setSettings(false)}
        onLeave={() => {
          setSettings(false);
          setOptIn(false);
        }}
      />
    </View>
  );
}

import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '@/features/parent/format';
import type { WeekOverview } from '@/features/parent/types';
import { WeekTile } from './WeekTile';

type WeekTilesProps = { week: WeekOverview };

/** The four facts of the week in a 2×2 grid; assignments only when the child shares them. */
export function WeekTiles({ week }: WeekTilesProps) {
  const { t } = useTranslation();
  const tasks = week.assignments;
  const allOnTime = tasks !== null && tasks.total > 0 && tasks.onTime === tasks.total;

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        <WeekTile
          icon="clock"
          value={formatDuration(t, week.minutes)}
          label={t('parent.kids.time')}
        />
        <WeekTile
          icon="calendar"
          value={t('parent.kids.activeDays', { count: week.activeDays })}
          label={t('parent.kids.activeDaysOf')}
        />
      </View>
      <View className="flex-row gap-2">
        <WeekTile
          icon="learn"
          value={t('parent.kids.newTopics', { count: week.newTopics })}
          label={t('parent.kids.newTopicsLabel')}
        />
        {tasks === null ? (
          <View className="flex-1" />
        ) : tasks.total === 0 ? (
          <WeekTile icon="list" value="0" label={t('parent.kids.noTasks')} />
        ) : allOnTime ? (
          <WeekTile
            icon="check"
            tone="ok"
            value={t('parent.kids.onTime')}
            label={t('parent.kids.onTimeOf', { onTime: tasks.onTime, total: tasks.total })}
          />
        ) : (
          <WeekTile
            icon="clock"
            value={`${tasks.onTime} / ${tasks.total}`}
            label={t('parent.kids.onTimeLabel')}
          />
        )}
      </View>
    </View>
  );
}

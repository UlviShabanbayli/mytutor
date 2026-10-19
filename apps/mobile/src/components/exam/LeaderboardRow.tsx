import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { minutesLabel } from '@/features/exam/labels';
import type { LeaderboardEntry } from '@/features/exam/types';
import { cn } from '@/lib/cn';
import { HexTile } from './HexTile';

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  /** The student's own row: inverted, with "· sən" after the nickname. */
  you?: boolean;
  /** "İlk 18%-in içindəsən" under the student's own nickname. */
  note?: string;
};

/** One place: rank, nickname initial on a hex, nickname, score and minutes. Nicknames only. */
export function LeaderboardRow({ entry, you = false, note }: LeaderboardRowProps) {
  const { t } = useTranslation();
  const minutes = minutesLabel(t, entry.minutes);
  const label = you
    ? t('exam.board.youA11y', { rank: entry.rank, nick: entry.nick, score: entry.score })
    : t('exam.board.rowA11y', { rank: entry.rank, nick: entry.nick, score: entry.score, minutes });

  return (
    <View
      accessible
      accessibilityLabel={note ? `${label}. ${note}` : label}
      className={cn(
        'flex-row items-center gap-2.5 rounded-md px-3',
        you ? 'min-h-[60px] rounded-lg bg-spot' : 'min-h-[50px] border border-border bg-surf',
      )}
    >
      <Text
        className={cn(
          'w-[34px] text-center font-display-black text-sm',
          you ? 'text-honey' : 'text-ink',
        )}
      >
        {String(entry.rank)}
      </Text>
      <HexTile
        tone={you || entry.rank <= 3 ? 'honey' : 'raised'}
        size={32}
        label={entry.nick.charAt(0)}
      />
      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className={cn('font-sans-bold text-base', you && 'font-sans-black text-on-spot')}
        >
          {you ? t('exam.board.you', { nick: entry.nick }) : entry.nick}
        </Text>
        {note ? <Text className="text-xs text-on-spot opacity-80">{note}</Text> : null}
      </View>
      <View className="items-end">
        <Text className={cn('font-sans-black text-base', you && 'text-on-spot')}>
          {String(entry.score)}
        </Text>
        <Text
          className={cn('font-sans-bold text-2xs', you ? 'text-on-spot opacity-75' : 'text-muted')}
        >
          {minutes}
        </Text>
      </View>
    </View>
  );
}

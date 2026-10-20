import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, PressableCard, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { initials } from '@/features/teacher/people';
import { LATE_AFTER_MINUTES, minutesSince } from '@/features/teacher/time';
import type { InboxQuestion } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import { HexBadge } from './HexBadge';

type InboxCardProps = { question: InboxQuestion; className: string; book: string; index: number };

function Chip({
  icon,
  label,
  box,
  text,
  color,
}: {
  icon: IconName;
  label: string;
  box: string;
  text: string;
  color: 'info' | 'lock-ink' | 'honey-text' | 'ok';
}) {
  return (
    <View className={cn('h-[24px] flex-row items-center gap-1 rounded-full px-2', box)}>
      <Icon name={icon} size={14} color={color} />
      <Text className={cn('font-sans-black text-xs', text)}>{label}</Text>
    </View>
  );
}

/** A student's question in the queue, with how long it waits and where the AI stands. */
export function InboxCard({ question: q, className, book, index }: InboxCardProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const late = !q.approved && minutesSince(new Date(q.askedAt), new Date()) >= LATE_AFTER_MINUTES;
  const wait = f.wait(q.askedAt);
  const status = q.approved
    ? t('teacher.inbox.statusApproved')
    : q.aiStatus === 'ready'
      ? t('teacher.inbox.statusSolved')
      : t('teacher.inbox.statusSolving');

  return (
    <PressableCard
      accessibilityLabel={t('teacher.inbox.cardLabel', {
        name: q.studentName,
        wait,
        text: q.title,
        status,
      })}
      onPress={() => router.push({ pathname: '/teacher/answer/[id]', params: { id: q.id } })}
      className="rounded-[18px]"
      contentClassName="gap-[7px] rounded-[18px] px-3 pb-3 pt-2.5"
    >
      <View className="flex-row items-center gap-2.5">
        <HexBadge size={36} tone={index % 2 ? 'raised' : 'wax'} label={initials(q.studentName)} />
        <View className="min-w-0 flex-1">
          <Text className="font-sans-black">{q.studentName}</Text>
          <Text className="font-sans-semibold text-xs text-muted">
            {t('teacher.inbox.meta', { class: className, book, topic: q.topic?.number ?? '' })}
          </Text>
        </View>
        {q.approved ? null : (
          <View
            className={cn(
              'flex-row items-center gap-1 rounded-full px-2 py-1',
              late ? 'bg-err-bg' : 'bg-page',
            )}
          >
            <Icon name="clock" size={14} color={late ? 'err' : 'muted'} />
            <Text className={cn('font-sans-black text-xs', late ? 'text-err' : 'text-muted')}>
              {wait}
            </Text>
          </View>
        )}
      </View>
      <Text className="font-sans text-sm leading-[20px]">{q.title}</Text>
      <View className="flex-row flex-wrap items-center gap-1.5">
        {q.approved ? (
          <Chip
            icon="check"
            label={t('teacher.inbox.approved')}
            box="bg-ok-bg"
            text="text-ok"
            color="ok"
          />
        ) : q.aiStatus === 'ready' ? (
          <Chip
            icon="check"
            label={t('teacher.inbox.solved')}
            box="bg-info-bg"
            text="text-info"
            color="info"
          />
        ) : (
          <Chip
            icon="refresh"
            label={t('teacher.inbox.solving')}
            box="bg-wax"
            text="text-lock-ink"
            color="lock-ink"
          />
        )}
        <Chip
          icon="image"
          label={t('teacher.inbox.photo')}
          box="bg-raised"
          text="text-honey-text"
          color="honey-text"
        />
      </View>
    </PressableCard>
  );
}

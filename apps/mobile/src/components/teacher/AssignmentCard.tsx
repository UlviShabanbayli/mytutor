import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, PressableCard, ProgressBar, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useTopic } from '@/features/teacher/queries';
import { dueStatus } from '@/features/teacher/time';
import type { ClassAssignment, TeacherClass } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';

type AssignmentCardProps = { assignment: ClassAssignment; cls: TeacherClass };

/** An assignment of a class: kind, audience, due date, how many did it, what waits for you. */
export function AssignmentCard({ assignment: a, cls }: AssignmentCardProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const topic = useTopic(a.topicId);
  const status = dueStatus(new Date(a.dueAt), new Date());
  const over = status === 'past';
  const urgent = status === 'today' || status === 'tomorrow';
  const percent = a.total ? Math.round((100 * a.done) / a.total) : 0;
  const done = t('teacher.assignment.done', { done: a.done, total: a.total, percent });
  const title = f.assignmentTitle(a, topic);
  const audience = f.audience(a.audience, cls);
  const due = f.due(a.dueAt);
  // Homework opens the check; the rest show their results in the class report.
  const open = () =>
    a.kind === 'homework'
      ? router.push({ pathname: '/teacher/grade/[id]', params: { id: a.id } })
      : router.push({ pathname: '/teacher/insights/[classId]', params: { classId: cls.id } });

  return (
    <PressableCard
      accessibilityLabel={t('teacher.assignment.cardLabel', {
        kind: t(`teacher.kinds.${a.kind}`),
        title,
        audience,
        due,
        done,
      })}
      onPress={open}
      className="rounded-[18px]"
      contentClassName="gap-[7px] rounded-[18px] px-3.5 py-3"
    >
      <View className="flex-row items-center gap-2">
        <View className="rounded-[8px] bg-raised px-2 py-1">
          <Text className="font-sans-black text-2xs uppercase tracking-[0.7px] text-honey-text">
            {t(`teacher.kinds.${a.kind}`)}
          </Text>
        </View>
        <Text numberOfLines={1} className="min-w-0 flex-1 font-sans-bold text-xs text-muted">
          {audience}
        </Text>
        <View
          className={cn(
            'flex-row items-center gap-1 rounded-full px-2 py-1',
            over ? 'bg-ok-bg' : urgent ? 'bg-raised' : 'bg-page',
          )}
        >
          <Icon
            name={over ? 'check' : 'clock'}
            size={14}
            color={over ? 'ok' : urgent ? 'honey-text' : 'muted'}
          />
          <Text
            className={cn(
              'font-sans-black text-xs',
              over ? 'text-ok' : urgent ? 'text-honey-text' : 'text-muted',
            )}
          >
            {due}
          </Text>
        </View>
      </View>
      <Text className="font-sans-black">{title}</Text>
      <View className="flex-row items-center gap-2.5">
        <ProgressBar
          value={a.total ? a.done / a.total : 0}
          tone={over ? 'ok' : 'honey'}
          accessibilityLabel={done}
          className="flex-1"
        />
        <Text className="font-sans-black text-xs">{done}</Text>
        {a.toGrade > 0 ? (
          <View className="rounded-full bg-raised px-2 py-1">
            <Text className="font-sans-black text-xs text-honey-text">
              {t('teacher.assignment.toGrade', { count: a.toGrade })}
            </Text>
          </View>
        ) : null}
      </View>
    </PressableCard>
  );
}

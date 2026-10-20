import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { dueLabel } from '@/features/today/format';
import { stepHref } from '@/features/today/plan';
import type { AssignmentDue } from '@/features/today/types';

type AssignmentDueRowProps = {
  assignment: AssignmentDue;
};

/**
 * A class assignment due soon: class, teacher, task and a chip with the deadline, "Göndərildi"
 * once handed in, or the teacher's grade once checked.
 */
export function AssignmentDueRow({ assignment }: AssignmentDueRowProps) {
  const { t } = useTranslation();
  const meta = t('today.assignment.meta', {
    className: assignment.className,
    subject: assignment.subject,
    teacher: assignment.teacher,
  });
  const title = t('today.assignment.title', { title: assignment.title });
  const { grade, state } = assignment;
  const handedIn = state === 'submitted' || state === 'checked';
  const graded = { score: grade?.score ?? 0, max: grade?.max ?? 0 };
  const chip = grade
    ? t('today.assignment.grade', graded)
    : handedIn
      ? t('today.assignment.submitted')
      : dueLabel(t, new Date(assignment.dueAt), new Date());
  const label =
    grade || handedIn
      ? t('today.assignment.labelState', {
          title,
          meta,
          state: grade
            ? t('today.assignment.gradeLabel', graded)
            : t('today.assignment.submittedLabel'),
        })
      : t('today.assignment.label', { title, meta, due: chip });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.push(stepHref('assignment', assignment.id))}
      className="min-h-touch flex-row items-center gap-3 rounded-lg bg-raised px-3 py-2.5 active:opacity-80"
    >
      <View className="h-10 w-10 items-center justify-center rounded-sm bg-surf">
        <Icon name="users" size={22} color="honey-text" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-bold text-xs text-muted" numberOfLines={1}>
          {meta}
        </Text>
        <Text className="font-sans-black" numberOfLines={2}>
          {title}
        </Text>
      </View>
      <View className={cn('shrink-0 rounded-full px-2 py-1.5', grade ? 'bg-ok-bg' : 'bg-surf')}>
        <Text
          className={cn(
            'font-sans-black text-xs',
            grade ? 'text-ok' : handedIn ? 'text-muted' : 'text-honey-text',
          )}
        >
          {chip}
        </Text>
      </View>
    </Pressable>
  );
}

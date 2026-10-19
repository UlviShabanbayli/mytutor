import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { dueLabel } from '@/features/today/format';
import { stepHref } from '@/features/today/plan';
import type { AssignmentDue } from '@/features/today/types';

type AssignmentDueRowProps = {
  assignment: AssignmentDue;
};

/** A class assignment due soon: class, teacher, task and the deadline chip. */
export function AssignmentDueRow({ assignment }: AssignmentDueRowProps) {
  const { t } = useTranslation();
  const meta = t('today.assignment.meta', {
    className: assignment.className,
    subject: assignment.subject,
    teacher: assignment.teacher,
  });
  const title = t('today.assignment.title', { title: assignment.title });
  const due = dueLabel(t, new Date(assignment.dueAt), new Date());

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('today.assignment.label', { title, meta, due })}
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
      <View className="shrink-0 rounded-full bg-surf px-2 py-1.5">
        <Text className="font-sans-black text-xs text-honey-text">{due}</Text>
      </View>
    </Pressable>
  );
}

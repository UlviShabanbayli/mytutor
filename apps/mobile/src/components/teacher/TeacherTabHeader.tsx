import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useTeacherProfile } from '@/features/teacher/queries';
import { TeacherRoleChip } from './TeacherRoleChip';

type TeacherTabHeaderProps = {
  title: string;
  /** One 44pt control on the right (bell or settings). */
  action?: ReactNode;
};

/** Top of a teacher tab: role chip and name above a 28pt title (design tab header). */
export function TeacherTabHeader({ title, action }: TeacherTabHeaderProps) {
  const profile = useTeacherProfile();

  return (
    <View className="flex-row items-end gap-2 px-4 pb-2.5 pt-3">
      <View className="min-w-0 flex-1 gap-1.5">
        <View className="flex-row items-center gap-2">
          <TeacherRoleChip />
          {profile.data ? (
            <Text variant="label" tone="muted" numberOfLines={1} className="flex-1">
              {profile.data.name}
            </Text>
          ) : null}
        </View>
        <Text variant="title">{title}</Text>
      </View>
      {action}
    </View>
  );
}

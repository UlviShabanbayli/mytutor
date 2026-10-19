import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sheet, Text } from '@/components/ui';
import { useSetMemberMuted, useToggleGroupMember } from '@/features/teacher/queries';
import type { ClassMember, TeacherClass } from '@/features/teacher/types';
import { ActionItem } from './ActionItem';

type MemberActionsSheetProps = {
  member: ClassMember | null;
  cls: TeacherClass;
  onClose: () => void;
  onRemove: (member: ClassMember) => void;
};

/** The "⋯" menu of a student (M2): report, groups, mute in chat, remove from the class. */
export function MemberActionsSheet({ member, cls, onClose, onRemove }: MemberActionsSheetProps) {
  const { t } = useTranslation();
  const mute = useSetMemberMuted();
  const toggleGroup = useToggleGroupMember();
  const [groupsOpen, setGroupsOpen] = useState(false);
  const close = () => {
    setGroupsOpen(false);
    onClose();
  };

  return (
    <Sheet
      visible={member !== null}
      onClose={close}
      title={member ? t('teacher.members.actions', { name: member.name }) : ''}
    >
      {member ? (
        <View accessibilityRole="menu" className="gap-0.5">
          <ActionItem
            icon="chart"
            label={t('teacher.members.viewReport')}
            disabledReason={member.sharesProgress ? undefined : t('teacher.members.reportHidden')}
            onPress={() => {
              close();
              router.push({ pathname: '/teacher/insights/[classId]', params: { classId: cls.id } });
            }}
          />
          <ActionItem
            icon="users"
            label={t('teacher.members.changeGroup')}
            onPress={() => setGroupsOpen((v) => !v)}
          />
          {groupsOpen ? (
            <View className="ml-7 gap-0.5 border-l-2 border-border pl-2">
              {cls.groups.length === 0 ? (
                <Text variant="caption" tone="muted" className="py-2">
                  {t('teacher.members.noGroups')}
                </Text>
              ) : (
                cls.groups.map((g) => {
                  const inGroup = g.memberIds.includes(member.id);
                  return (
                    <ActionItem
                      key={g.id}
                      role="checkbox"
                      checked={inGroup}
                      icon="users"
                      label={g.name}
                      onPress={() =>
                        toggleGroup.mutate({ classId: cls.id, groupId: g.id, memberId: member.id })
                      }
                    />
                  );
                })
              )}
            </View>
          ) : null}
          <ActionItem
            icon="chat"
            label={member.mutedInChat ? t('teacher.members.unmute') : t('teacher.members.mute')}
            onPress={() => {
              mute.mutate({ classId: cls.id, memberId: member.id, muted: !member.mutedInChat });
              close();
            }}
          />
          <ActionItem
            icon="logout"
            danger
            label={t('teacher.members.remove')}
            onPress={() => {
              close();
              onRemove(member);
            }}
          />
        </View>
      ) : null}
    </Sheet>
  );
}

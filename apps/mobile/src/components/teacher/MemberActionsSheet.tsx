import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sheet, Text } from '@/components/ui';
import type { RosterEntry } from '@mytutor/types';
import type { TeacherClass } from '@/features/teacher/types';
import { ActionItem } from './ActionItem';

type MemberActionsSheetProps = {
  member: RosterEntry | null;
  cls: TeacherClass;
  onClose: () => void;
  onToggleGroup: (groupId: string, personId: string) => void;
  onMute: (personId: string, muted: boolean) => void;
  onRemove: (member: RosterEntry) => void;
};

/** The "⋯" menu of a student (M2): report, groups, mute in chat, remove from the class. */
export function MemberActionsSheet({
  member,
  cls,
  onClose,
  onToggleGroup,
  onMute,
  onRemove,
}: MemberActionsSheetProps) {
  const { t } = useTranslation();
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
                  const inGroup = g.memberIds.includes(member.personId);
                  return (
                    <ActionItem
                      key={g.id}
                      role="checkbox"
                      checked={inGroup}
                      icon="users"
                      label={g.name}
                      onPress={() => onToggleGroup(g.id, member.personId)}
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
              onMute(member.personId, !member.mutedInChat);
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

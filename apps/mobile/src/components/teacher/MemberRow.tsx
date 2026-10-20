import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { initials } from '@/features/teacher/people';
import type { RosterEntry } from '@mytutor/types';
import { HexBadge } from './HexBadge';

type Tag = {
  label: string;
  icon?: IconName;
  box: string;
  text: string;
  color?: 'ok' | 'lock-ink' | 'err';
};

type MemberRowProps = {
  member: RosterEntry;
  /** Names of the groups this student is in. */
  groups: string[];
  index: number;
  onMore: () => void;
};

/** A student of the class with what they let the teacher see, groups and chat state. */
export function MemberRow({ member, groups, index, onMore }: MemberRowProps) {
  const { t } = useTranslation();
  const tags: Tag[] = [
    member.sharesProgress
      ? {
          label: t('teacher.members.sharesProgress'),
          icon: 'eye',
          box: 'bg-ok-bg',
          text: 'text-ok',
          color: 'ok',
        }
      : {
          label: t('teacher.members.onlyAssignments'),
          icon: 'lock',
          box: 'bg-wax',
          text: 'text-lock-ink',
          color: 'lock-ink',
        },
    ...groups.map((g) => ({ label: g, box: 'bg-raised', text: 'text-honey-text' })),
    ...(member.mutedInChat
      ? [
          {
            label: t('teacher.members.muted'),
            icon: 'chat' as const,
            box: 'bg-err-bg',
            text: 'text-err',
            color: 'err' as const,
          },
        ]
      : []),
  ];

  return (
    <View
      accessibilityRole="none"
      className="min-h-[62px] flex-row items-center gap-2.5 rounded-lg border border-border bg-surf py-1.5 pl-2.5 pr-1"
    >
      <HexBadge size={38} tone={index % 2 ? 'raised' : 'wax'} label={initials(member.name)} />
      <View
        accessible
        className="min-w-0 flex-1 gap-1"
        accessibilityLabel={[member.name, ...tags.map((x) => x.label)].join(', ')}
      >
        <Text className="font-sans-black">{member.name}</Text>
        <View className="flex-row flex-wrap gap-1">
          {tags.map((tag) => (
            <View
              key={tag.label}
              className={cn('h-[22px] flex-row items-center gap-1 rounded-[7px] px-[7px]', tag.box)}
            >
              {tag.icon && tag.color ? <Icon name={tag.icon} size={13} color={tag.color} /> : null}
              <Text className={cn('font-sans-black text-2xs', tag.text)}>{tag.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('teacher.members.actions', { name: member.name })}
        onPress={onMore}
        className="h-[44px] w-[44px] items-center justify-center rounded-md active:bg-raised"
      >
        <Icon name="more" size={22} color="ink" />
      </Pressable>
    </View>
  );
}

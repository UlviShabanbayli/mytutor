import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';
import { formatWhen } from '@/features/me/format';
import type { ClassFeed, ClassSummary } from '@/features/me/types';
import { TeacherTag } from './TeacherTag';

type AnnouncementCardProps = {
  item: ClassFeed['announcement'];
  teacher: Pick<ClassSummary, 'teacher' | 'teacherInitials'>;
  reported: boolean;
  onReport: () => void;
};

/** The teacher's announcement on the class feed, with "Şikayət et" behind the ⋯ button. */
export function AnnouncementCard({ item, teacher, reported, onReport }: AnnouncementCardProps) {
  const { t } = useTranslation();
  return (
    <View
      accessibilityLabel={t('me.classPage.announcementLabel')}
      className="gap-2 rounded-[18px] border border-border bg-surf py-3 pl-3.5 pr-1.5"
    >
      <View className="flex-row items-center gap-1">
        <TeacherTag
          name={teacher.teacher}
          initials={teacher.teacherInitials}
          meta={t('me.classPage.announcementMeta', { when: formatWhen(t, item.time) })}
        />
        <IconButton
          icon="more"
          color="muted"
          accessibilityLabel={t('me.classPage.announcementOptions')}
          onPress={onReport}
        />
      </View>
      <Text className="pr-2 leading-[21px]">{item.text}</Text>
      {reported ? (
        <Text tone="muted" className="text-xs">
          {t('me.chat.reported')}
        </Text>
      ) : null}
    </View>
  );
}

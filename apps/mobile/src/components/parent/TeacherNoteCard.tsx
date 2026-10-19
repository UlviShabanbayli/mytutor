import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Card, Text } from '@/components/ui';
import { HexAvatar } from './HexAvatar';

type TeacherNoteCardProps = { teacherName: string; text: string };

/** The teacher's short note on the week, quoted with a honey rule. */
export function TeacherNoteCard({ teacherName, text }: TeacherNoteCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="gap-2 rounded-[18px] p-3">
      <View className="flex-row items-center gap-2.5">
        <HexAvatar name={teacherName} tone="info" size={40} />
        <Text accessibilityRole="header" className="min-w-0 flex-1 font-sans-black">
          {teacherName}
        </Text>
        <Badge
          tone="ok"
          icon="check"
          label={t('parent.report.teacherBadge')}
          className="self-center"
        />
      </View>
      <View className="border-l-[3px] border-honey pl-3">
        <Text className="text-sm leading-5">{text}</Text>
      </View>
    </Card>
  );
}

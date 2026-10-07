import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Subject } from '@mytutor/types';
import { Icon, PressableCard, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { subjectIcon } from './subjectIcon';

type SubjectCardProps = {
  subject: Subject;
  onPress: () => void;
  className?: string;
};

export function SubjectCard({ subject, onPress, className }: SubjectCardProps) {
  const { t } = useTranslation();
  const available = subject.questionCount > 0;
  const meta = available
    ? t('common.questionsCount', { count: subject.questionCount })
    : t('common.comingSoon');

  return (
    <PressableCard
      onPress={onPress}
      accessibilityLabel={`${subject.title}, ${meta}`}
      className={cn('flex-1', className)}
      contentClassName="min-h-36 justify-between gap-3"
    >
      <View
        className={cn(
          'h-12 w-12 items-center justify-center rounded-md',
          available ? 'bg-secondary' : 'bg-muted',
        )}
      >
        <Icon
          name={subjectIcon(subject.icon)}
          color={available ? 'secondary-foreground' : 'muted-foreground'}
        />
      </View>
      <View className="gap-0.5">
        <Text variant="subheading" numberOfLines={2}>
          {subject.title}
        </Text>
        <Text variant="label" tone="muted">
          {meta}
        </Text>
      </View>
    </PressableCard>
  );
}

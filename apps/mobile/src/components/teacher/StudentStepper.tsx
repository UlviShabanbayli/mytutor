import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';
import { initials } from '@/features/teacher/people';
import { HexBadge } from './HexBadge';

type StudentStepperProps = {
  name: string;
  meta: string;
  prevName?: string;
  nextName?: string;
  onPrev: () => void;
  onNext: () => void;
};

/** The student being checked, with the previous and next ones a tap away. */
export function StudentStepper({
  name,
  meta,
  prevName,
  nextName,
  onPrev,
  onNext,
}: StudentStepperProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-1.5">
      <View className={prevName ? undefined : 'opacity-0'}>
        <IconButton
          icon="back"
          variant="outlined"
          accessibilityLabel={t('teacher.grade.prev', { name: prevName ?? '' })}
          onPress={onPrev}
        />
      </View>
      <View accessible className="min-w-0 flex-1 flex-row items-center justify-center gap-2.5">
        <HexBadge size={36} tone="honey" label={initials(name)} />
        <View className="min-w-0 shrink gap-px">
          <Text className="font-sans-black" numberOfLines={1}>
            {name}
          </Text>
          <Text className="font-sans-semibold text-xs text-muted" numberOfLines={1}>
            {meta}
          </Text>
        </View>
      </View>
      <View className={nextName ? undefined : 'opacity-0'}>
        <IconButton
          icon="chevron"
          variant="outlined"
          accessibilityLabel={t('teacher.grade.next', { name: nextName ?? '' })}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

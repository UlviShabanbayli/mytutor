import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';

type ExamTabHeaderProps = {
  /** "Qəbul · II qrup" (shown in CAPS), or "Hədəf seçilməyib" before a goal exists. */
  label: string;
  /** Calendar and goal buttons, once there is a goal to plan for. */
  showActions: boolean;
};

/** The exam tab's title row. */
export function ExamTabHeader({ label, showActions }: ExamTabHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-end gap-2">
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="overline" tone="muted" className="text-xs">
          {label}
        </Text>
        <Text variant="title">{t('exam.tab.title')}</Text>
      </View>
      {showActions ? (
        <>
          <IconButton
            icon="calendar"
            variant="outlined"
            accessibilityLabel={t('exam.tab.deadlines')}
            onPress={() => router.push('/exam/deadlines')}
          />
          <IconButton
            icon="target"
            variant="outlined"
            accessibilityLabel={t('exam.tab.changeGoal')}
            onPress={() => router.push('/exam/setup')}
          />
        </>
      ) : null}
    </View>
  );
}

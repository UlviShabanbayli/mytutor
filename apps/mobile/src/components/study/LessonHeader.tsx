import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';
import type { LessonStepName } from '@/features/study/types';
import { cn } from '@/lib/cn';

type LessonHeaderProps = {
  /** The lesson's steps, in order. */
  steps: LessonStepName[];
  /** 0-based step index. */
  step: number;
  onClose: () => void;
};

/** Close, one segment per step and "Mətn · 2/4". */
export function LessonHeader({ steps, step, onClose }: LessonHeaderProps) {
  const { t } = useTranslation();
  const total = steps.length;
  const name = t(`study.lesson.steps.${steps[step] ?? 'text'}`);

  return (
    <View className="flex-row items-center gap-1.5 px-2 pb-1.5">
      <IconButton icon="close" accessibilityLabel={t('study.lesson.close')} onPress={onClose} />
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={t('study.lesson.stepAria', { n: step + 1, total, name })}
        accessibilityValue={{ min: 1, max: total, now: step + 1 }}
        className="flex-1 flex-row gap-1"
      >
        {steps.map((key, i) => (
          <View
            key={key}
            className={cn('h-2 flex-1 rounded-full', i <= step ? 'bg-honey' : 'bg-wax')}
          />
        ))}
      </View>
      <Text className="pr-2 text-right font-sans-black text-sm text-muted">
        {t('study.lesson.stepLabel', { name, n: step + 1, total })}
      </Text>
    </View>
  );
}

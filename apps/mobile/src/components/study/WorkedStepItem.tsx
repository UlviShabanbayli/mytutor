import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { WorkedStep } from '@/features/study/types';

type WorkedStepItemProps = {
  number: number;
  step: WorkedStep;
  /** Hidden: a dashed placeholder until the student asks for it. */
  hidden?: boolean;
};

/** One numbered step of a solved example. */
export function WorkedStepItem({ number, step, hidden = false }: WorkedStepItemProps) {
  const { t } = useTranslation();

  if (hidden) {
    return (
      <View
        accessible
        accessibilityLabel={t('study.lesson.hiddenStep', { title: step.title })}
        className="flex-row gap-3"
      >
        <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-wax">
          <Text className="font-sans-black text-sm text-lock-ink">{number}</Text>
        </View>
        <View className="flex-1 flex-row items-center gap-2.5 rounded-lg border-2 border-dashed border-border px-3 py-2.5">
          <Icon name="eye" size={20} color="muted" />
          <View className="flex-1 gap-1.5">
            <Text tone="muted" className="font-sans-bold text-sm">
              {step.title}
            </Text>
            <View className="flex-row gap-1.5">
              <View className="h-2.5 w-[70px] rounded-full bg-wax" />
              <View className="h-2.5 w-24 rounded-full bg-wax" />
              <View className="h-2.5 w-[52px] rounded-full bg-wax" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row gap-3">
      <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-honey">
        <Text className="font-sans-black text-sm text-on-honey">{number}</Text>
      </View>
      <View className="min-w-0 flex-1 gap-1 rounded-lg bg-raised px-3 py-2.5">
        <Text tone="honey" className="font-sans-bold text-sm">
          {step.title}
        </Text>
        <Text className="font-sans-semibold text-md">{step.body}</Text>
      </View>
    </View>
  );
}

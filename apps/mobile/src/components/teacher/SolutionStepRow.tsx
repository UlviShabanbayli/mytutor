import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { SolutionStep } from '@mytutor/types';
import { useThemeColors } from '@/theme';
import { SmallButton } from './SmallButton';

type SolutionStepRowProps = {
  step: SolutionStep;
  index: number;
  editing: boolean;
  onEdit: () => void;
  onSave: (step: SolutionStep) => void;
  onRemove: () => void;
  /** Approved answers are read-only. */
  locked?: boolean;
};

/** One numbered step of a solution; the teacher edits its explanation and formula in place. */
export function SolutionStepRow({
  step,
  index,
  editing,
  onEdit,
  onSave,
  onRemove,
  locked,
}: SolutionStepRowProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [label, setLabel] = useState(step.text);
  const [formula, setFormula] = useState(step.formula);
  const field =
    'min-h-[44px] rounded-md border-2 border-border bg-page px-3 font-sans text-base text-ink';

  return (
    <View className="flex-row items-center gap-2.5 rounded-md border border-border bg-surf py-2 pl-2.5 pr-1">
      <View className="h-[28px] w-[28px] items-center justify-center self-start rounded-full bg-info-bg">
        <Text className="font-sans-black text-sm text-info">{index + 1}</Text>
      </View>
      {editing ? (
        <View className="min-w-0 flex-1 gap-2 pr-1.5">
          <TextInput
            value={label}
            onChangeText={setLabel}
            accessibilityLabel={t('teacher.answer.stepLabel')}
            placeholder={t('teacher.answer.stepLabel')}
            placeholderTextColor={colors.muted}
            className={field}
          />
          <TextInput
            value={formula}
            onChangeText={setFormula}
            accessibilityLabel={t('teacher.answer.stepFormula')}
            placeholder={t('teacher.answer.stepFormula')}
            placeholderTextColor={colors.muted}
            autoCorrect={false}
            className={`${field} font-sans-bold`}
          />
          <View className="flex-row gap-2">
            <SmallButton
              label={t('teacher.answer.stepSave')}
              icon="check"
              onPress={() =>
                onSave({ ...step, text: label.trim(), formula: formula.trim(), edited: true })
              }
            />
            <SmallButton
              variant="outline"
              label={t('teacher.answer.stepRemove')}
              icon="trash"
              onPress={onRemove}
            />
          </View>
        </View>
      ) : (
        <>
          <View accessible className="min-w-0 flex-1 gap-0.5">
            <Text className="font-sans-bold text-xs text-muted">
              {step.text}
              {step.edited ? ` · ${t('teacher.answer.edited')}` : ''}
            </Text>
            <Text className="font-sans-black text-base leading-[21px]">{step.formula}</Text>
          </View>
          {locked ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('teacher.answer.editStep', { index: index + 1 })}
              onPress={onEdit}
              className="h-[44px] w-[44px] items-center justify-center rounded-md active:bg-raised"
            >
              <Icon name="edit" size={20} color="honey-text" />
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

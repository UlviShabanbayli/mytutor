import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

type Selection = { start: number; end: number };

type ExpressionFieldProps = {
  value: string;
  selection: Selection;
  /** Answered like the book: green with "Düz". */
  correct: boolean;
  editable: boolean;
  onChange: (value: string) => void;
  onSelectionChange: (selection: Selection) => void;
};

/** The exercise answer: a 58pt honey field on its darker edge; green once it matches the book. */
export function ExpressionField({
  value,
  selection,
  correct,
  editable,
  onChange,
  onSelectionChange,
}: ExpressionFieldProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View className="gap-1.5">
      <Text variant="label">{t('study.lesson.answerLabel')}</Text>
      <View className={cn('rounded-lg', !correct && 'bg-honey-deep pb-[3px]')}>
        <View
          className={cn(
            'min-h-[58px] flex-row items-center gap-2 rounded-lg border-2 px-3.5',
            correct ? 'border-ok bg-ok-bg' : 'border-honey bg-surf',
          )}
        >
          <TextInput
            accessibilityLabel={t('study.lesson.answerLabel')}
            value={value}
            selection={selection}
            editable={editable}
            onChangeText={onChange}
            onSelectionChange={(e) => onSelectionChange(e.nativeEvent.selection)}
            placeholder={t('study.lesson.answerPlaceholder')}
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            className="min-h-[54px] flex-1 font-sans-semibold text-lg text-ink"
          />
          {correct ? (
            <View className="flex-row items-center gap-1">
              <Icon name="check" size={18} color="ok" />
              <Text className="font-sans-black text-sm text-ok">{t('ui.correct')}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

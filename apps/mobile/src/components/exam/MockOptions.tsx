import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OptionKey } from '@mytutor/types';
import { AnswerOption, Icon, Text } from '@/components/ui';
import type { MockQuestion } from '@/features/exam/types';

type MockOptionsProps = {
  question: MockQuestion;
  selected: OptionKey | undefined;
  onSelect: (key: OptionKey) => void;
};

/** A–E answers. No right or wrong during a mock: feedback comes only at the end. */
export function MockOptions({ question, selected, onSelect }: MockOptionsProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('exam.run.optionsA11y')}
        className="gap-2"
      >
        {question.options.map((option) => {
          const on = option.key === selected;
          return (
            <AnswerOption
              key={option.key}
              letter={option.key}
              state={on ? 'selected' : 'idle'}
              onPress={() => onSelect(option.key)}
              accessibilityLabel={t('session.optionLabel', { key: option.key, text: option.text })}
            >
              <View className="flex-row items-center gap-2">
                <Text className="min-w-0 flex-1 font-sans-semibold text-md">{option.text}</Text>
                {on ? (
                  <Text className="font-sans-black text-xs text-honey-text">
                    {t('exam.run.selected')}
                  </Text>
                ) : null}
              </View>
            </AnswerOption>
          );
        })}
      </View>
      {selected ? (
        <View
          accessibilityRole="summary"
          accessibilityLiveRegion="polite"
          className="flex-row items-center gap-1.5"
        >
          <Icon name="check" size={14} color="ok" />
          <Text className="font-sans-bold text-xs text-ok">{t('exam.run.saved')}</Text>
        </View>
      ) : null}
    </View>
  );
}

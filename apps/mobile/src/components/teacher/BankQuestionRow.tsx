import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SourceLine, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { BankQuestion } from '@mytutor/types';
import { CheckBox } from './CheckBox';

type BankQuestionRowProps = { question: BankQuestion; selected: boolean; onToggle: () => void };

/** A bank question to tick into the test; it goes in as it is (never edited). */
export function BankQuestionRow({ question: q, selected, onToggle }: BankQuestionRowProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={
        selected
          ? t('teacher.builder.pickedLabel', { text: q.text })
          : t('teacher.builder.pickLabel', { text: q.text })
      }
      onPress={onToggle}
      className={cn(
        'flex-row items-start gap-2.5 rounded-lg border-2 px-3 py-2.5 active:opacity-90',
        selected ? 'border-honey bg-raised' : 'border-border bg-surf',
      )}
    >
      <CheckBox checked={selected} />
      <View className="min-w-0 flex-1 gap-[5px]">
        <Text className="font-sans-semibold text-sm leading-[20px]">{q.text}</Text>
        <SourceLine source={q.source} />
        <View className="h-[22px] flex-row items-center gap-1 self-start rounded-[7px] bg-wax px-[7px]">
          <Icon name="lock" size={12} color="lock-ink" />
          <Text className="font-sans-black text-2xs text-lock-ink">
            {t('teacher.builder.noEdit')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

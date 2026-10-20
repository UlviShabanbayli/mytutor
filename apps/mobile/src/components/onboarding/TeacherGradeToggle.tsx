import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SelectPop, Text, useRaisedPress } from '@/components/ui';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';

type TeacherGradeToggleProps = {
  grade: number;
  selected: boolean;
  onToggle: () => void;
};

/**
 * One grade a teacher may teach: a raised toggle that sinks onto its edge while pressed
 * (buttons.primary A) and pops when turned on (buttons.grade B).
 */
export function TeacherGradeToggle({ grade, selected, onToggle }: TeacherGradeToggleProps) {
  const { t } = useTranslation();
  // The toggle plays the selection tick itself, so the press stays silent.
  const press = useRaisedPress({ depth: 3, cue: false });

  return (
    <SelectPop selected={selected}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={t('common.grade', { count: grade, ordinal: true })}
        onPress={() => {
          playCue('select');
          onToggle();
        }}
        onPressIn={press.pressIn}
        onPressOut={press.pressOut}
        className={cn('rounded-md pb-[3px]', selected ? 'bg-honey-deep' : 'bg-border')}
      >
        <Animated.View style={press.faceStyle}>
          <View
            className={cn(
              'h-12 items-center justify-center rounded-md border-2',
              selected ? 'border-honey bg-honey' : 'border-border bg-surf',
            )}
          >
            <Text
              className={cn('font-display-black text-md', selected ? 'text-on-honey' : 'text-ink')}
            >
              {String(grade)}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </SelectPop>
  );
}

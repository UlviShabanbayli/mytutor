import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SelectPop, Text } from '@/components/ui';
import { playCue } from '@/lib/cues';
import type { TopicView } from '@/features/teacher/types';
import { HexBadge } from './HexBadge';

/** A topic id, or `unit` for the unit test cell ("ana arı hüceyrəsi"). */
export type TopicChoice = string;
export const UNIT_TEST = 'unit';

type HexTopicPickerProps = {
  topics: TopicView[];
  unit: string;
  value: TopicChoice;
  onChange: (value: TopicChoice) => void;
  /** Names the group for screen readers (the caps label above it). */
  label: string;
};

/**
 * The unit's cells in a row and the bigger unit-test cell at the end; the chosen one is honey
 * and pops (buttons.grade B).
 */
export function HexTopicPicker({ topics, unit, value, onChange, label }: HexTopicPickerProps) {
  const { t } = useTranslation();
  const unitOn = value === UNIT_TEST;

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      className="flex-row items-center justify-between"
    >
      {topics.map((topic) => {
        const on = topic.id === value;
        return (
          <SelectPop key={topic.id} selected={on}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={t('teacher.assign.topicLabel', {
                id: topic.number,
                title: topic.title,
              })}
              onPress={() => {
                if (!on) playCue('select');
                onChange(topic.id);
              }}
              className="active:opacity-80"
            >
              <HexBadge size={52} tone={on ? 'honey' : 'wax'} label={topic.number} />
            </Pressable>
          </SelectPop>
        );
      })}
      <SelectPop selected={unitOn}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: unitOn }}
          accessibilityLabel={t('teacher.assign.unitTestLabel', { unit })}
          onPress={() => {
            if (!unitOn) playCue('select');
            onChange(UNIT_TEST);
          }}
          className="active:opacity-80"
        >
          <HexBadge size={60} tone={unitOn ? 'honey' : 'wax'}>
            <Icon name="star" size={18} color={unitOn ? 'on-honey' : 'ink'} />
            <Text
              className={
                unitOn
                  ? 'font-sans-black text-2xs text-on-honey'
                  : 'font-sans-black text-2xs text-ink'
              }
            >
              {t('teacher.assign.unitTest')}
            </Text>
          </HexBadge>
        </Pressable>
      </SelectPop>
    </View>
  );
}

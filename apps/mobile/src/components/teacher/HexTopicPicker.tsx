import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { TopicView } from '@/features/teacher/types';
import { HexBadge } from './HexBadge';

/** A topic id, or `unit` for the unit test cell ("ana arı hüceyrəsi"). */
export type TopicChoice = string;
export const UNIT_TEST = 'unit';

type HexTopicPickerProps = {
  topics: TopicView[];
  unit: number;
  value: TopicChoice;
  onChange: (value: TopicChoice) => void;
  /** Names the group for screen readers (the caps label above it). */
  label: string;
};

/** The unit's cells in a row and the bigger unit-test cell at the end; the chosen one is honey. */
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
          <Pressable
            key={topic.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={t('teacher.assign.topicLabel', {
              id: topic.id,
              title: topic.title,
            })}
            onPress={() => onChange(topic.id)}
            className="active:opacity-80"
          >
            <HexBadge size={52} tone={on ? 'honey' : 'wax'} label={topic.id} />
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: unitOn }}
        accessibilityLabel={t('teacher.assign.unitTestLabel', { unit })}
        onPress={() => onChange(UNIT_TEST)}
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
    </View>
  );
}

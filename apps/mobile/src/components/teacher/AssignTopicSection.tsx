import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { UnitView } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import { HexTopicPicker, UNIT_TEST } from './HexTopicPicker';
import { Overline } from './Overline';
import { SelectedTopic } from './SelectedTopic';

type AssignTopicSectionProps = {
  unit: UnitView;
  value: string;
  onChange: (value: string) => void;
};

/** "Mövzu · çərçivə 4": the cells to pick from and the chosen topic with its source. */
export function AssignTopicSection({ unit, value, onChange }: AssignTopicSectionProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const isUnit = value === UNIT_TEST;
  const topic = unit.topics.find((x) => x.id === value) ?? null;

  return (
    <View className="gap-2">
      <Overline>{t('teacher.assign.topic', { unit: unit.number })}</Overline>
      <HexTopicPicker
        topics={unit.topics}
        unit={unit.number}
        value={value}
        onChange={onChange}
        label={t('teacher.assign.topic', { unit: unit.number })}
      />
      <SelectedTopic
        title={
          isUnit ? t('teacher.assign.unitTestLine', { unit: unit.number }) : f.topicLine(topic)
        }
        source={f.topicSource(unit, isUnit ? null : topic)}
      />
    </View>
  );
}

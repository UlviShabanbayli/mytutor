import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TopicView } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import { HexTopicPicker, UNIT_TEST } from './HexTopicPicker';
import { Overline } from './Overline';
import { SelectedTopic } from './SelectedTopic';

type AssignTopicSectionProps = {
  unit: number;
  book: string;
  topics: TopicView[];
  value: string;
  onChange: (value: string) => void;
};

/** "Mövzu · çərçivə 4": the cells to pick from and the chosen topic with its source. */
export function AssignTopicSection({
  unit,
  book,
  topics,
  value,
  onChange,
}: AssignTopicSectionProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const isUnit = value === UNIT_TEST;
  const topic = topics.find((x) => x.id === value);

  return (
    <View className="gap-2">
      <Overline>{t('teacher.assign.topic', { unit })}</Overline>
      <HexTopicPicker
        topics={topics}
        unit={unit}
        value={value}
        onChange={onChange}
        label={t('teacher.assign.topic', { unit })}
      />
      <SelectedTopic
        title={isUnit ? t('teacher.assign.unitTestLine', { unit }) : f.topicLine(topic, value)}
        source={f.source(
          isUnit
            ? { book, section: t('teacher.unitTitle', { unit }) }
            : { book, section: value, page: topic?.page },
        )}
      />
    </View>
  );
}

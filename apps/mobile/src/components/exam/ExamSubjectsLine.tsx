import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Text } from '@/components/ui';
import { subjectName } from '@/features/exam/labels';
import type { ExamSubject } from '@/features/exam/types';

type ExamSubjectsLineProps = {
  subjects: ExamSubject[];
};

/** The chosen exam's subjects: Riyaziyyat has content, the rest are "hazırlanır". */
export function ExamSubjectsLine({ subjects }: ExamSubjectsLineProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row flex-wrap items-center gap-1.5">
      <Text tone="muted" className="font-sans-bold text-xs">
        {t('exam.setup.subjects')}
      </Text>
      {subjects.map((subject) =>
        subject === 'math' ? (
          <Badge key={subject} tone="honey" label={subjectName(t, subject)} />
        ) : (
          <Badge
            key={subject}
            tone="neutral"
            label={t('exam.setup.subjectPreparing', { subject: subjectName(t, subject) })}
          />
        ),
      )}
    </View>
  );
}

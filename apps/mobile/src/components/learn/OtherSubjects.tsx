import { router } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import type { SubjectEntry } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { SubjectTile } from './SubjectTile';

type OtherSubjectsProps = {
  grade: number;
  subjects: SubjectEntry[];
};

/** The grade's other subjects in two columns; each opens, and says "Hazırlanır" for now. */
export function OtherSubjects({ grade, subjects }: OtherSubjectsProps) {
  const { t, grade: gradeText } = useLearnText();
  const rows: SubjectEntry[][] = [];
  for (let i = 0; i < subjects.length; i += 2) rows.push(subjects.slice(i, i + 2));

  return (
    <View className="gap-2.5">
      <View className="mt-1 flex-row items-baseline justify-between gap-2">
        <Text variant="heading" className="text-[18px]">
          {t('learn.tab.otherSubjects')}
        </Text>
        <Text className="font-sans-bold text-xs" tone="muted">
          {gradeText(grade)}
        </Text>
      </View>
      {rows.map((row) => (
        <View key={row.map((s) => s.id).join('|')} className="flex-row gap-2.5">
          {row.map((subject) => (
            <SubjectTile
              key={subject.id}
              name={subject.name}
              monogram={subject.monogram}
              meta={t('learn.tab.preparing')}
              ready={false}
              accessibilityLabel={t('learn.tab.preparingAria', {
                name: subject.name,
                grade: gradeText(subject.grade),
              })}
              onPress={() => router.push({ pathname: '/subject/[id]', params: { id: subject.id } })}
              className="flex-1"
            />
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}

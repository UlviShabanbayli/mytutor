import { router } from 'expo-router';
import { View } from 'react-native';
import type { Subject } from '@mytutor/types';
import { SubjectCard } from './SubjectCard';

type SubjectGridProps = {
  subjects: Subject[];
};

/** Two-column grid; short lists only (subjects), so no virtualization needed. */
export function SubjectGrid({ subjects }: SubjectGridProps) {
  const rows: Subject[][] = [];
  for (let i = 0; i < subjects.length; i += 2) rows.push(subjects.slice(i, i + 2));

  return (
    <View className="gap-3">
      {rows.map((row) => (
        <View key={row.map((s) => s.id).join('-')} className="flex-row gap-3">
          {row.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onPress={() => router.push({ pathname: '/subject/[id]', params: { id: subject.id } })}
            />
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}

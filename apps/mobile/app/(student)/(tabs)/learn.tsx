import { useState } from 'react';
import { View } from 'react-native';
import { GradeEmpty } from '@/components/learn/GradeEmpty';
import { GradePicker } from '@/components/learn/GradePicker';
import { HiveCard } from '@/components/learn/HiveCard';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { LearnSkeleton } from '@/components/learn/LearnSkeleton';
import { OtherSubjects } from '@/components/learn/OtherSubjects';
import { ErrorState, Icon, Screen, SkeletonSwap, Text } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { openHive, openTopic } from '@/features/learn/navigation';
import { DEFAULT_GRADE, useGradeSubjects } from '@/features/learn/queries';
import { useLearnText } from '@/features/learn/useLearnText';

/** Öyrən: grades 5–11 (all open), the grade's hive box and its other subjects. */
export default function LearnScreen() {
  const { t, grade: gradeText } = useLearnText();
  const ownGrade = useAppStore((s) => s.profile.grade);
  const [grade, setGrade] = useState(ownGrade ?? DEFAULT_GRADE);
  const { query, hive, preparing } = useGradeSubjects(grade);

  return (
    <Screen>
      <LearnHeader />
      <GradePicker value={grade} ownGrade={ownGrade} onChange={setGrade} />
      {query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.isPending || hive ? (
        // transitions.skeleton C: the grade's skeleton cross-fades into its hive.
        <SkeletonSwap pending={query.isPending} skeleton={<LearnSkeleton />} className="gap-3">
          {hive ? (
            <>
              <HiveCard
                hive={hive}
                overline={grade === ownGrade ? t('learn.tab.forYourGrade') : gradeText(grade)}
                onOpen={() => openHive(hive.id)}
                onContinue={openTopic}
              />
              <OtherSubjects grade={grade} subjects={preparing} />
              <View className="flex-row items-start gap-2">
                <Icon name="info" size={16} color="info" />
                <Text variant="caption" tone="muted" className="flex-1 font-sans">
                  {ownGrade
                    ? t('learn.tab.allOpen', { grade: gradeText(ownGrade) })
                    : t('learn.tab.allOpenNoProfile')}
                </Text>
              </View>
            </>
          ) : null}
        </SkeletonSwap>
      ) : (
        <GradeEmpty grade={grade} ownGrade={ownGrade} onBack={setGrade} />
      )}
    </Screen>
  );
}

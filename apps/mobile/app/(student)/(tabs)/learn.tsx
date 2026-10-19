import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { GradeEmpty } from '@/components/learn/GradeEmpty';
import { GradePicker } from '@/components/learn/GradePicker';
import { HiveCard } from '@/components/learn/HiveCard';
import { OtherSubjects } from '@/components/learn/OtherSubjects';
import { CollapsingTitle, ErrorState, Icon, IconButton, LoadingState, Text } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { openHive, openTopic } from '@/features/learn/navigation';
import { DEFAULT_GRADE, useGradeSubjects } from '@/features/learn/queries';
import { useLearnText } from '@/features/learn/useLearnText';

/**
 * Öyrən: grades 5–11 (all open), the grade's hive box and its other subjects. The large title
 * shrinks into a bar as the page scrolls (micro.header B).
 */
export default function LearnScreen() {
  const { t, grade: gradeText } = useLearnText();
  const ownGrade = useAppStore((s) => s.profile.grade);
  const [grade, setGrade] = useState(ownGrade ?? DEFAULT_GRADE);
  const { query, hive, preparing } = useGradeSubjects(grade);

  return (
    <CollapsingTitle
      overline={t('learn.tab.overline')}
      title={t('learn.tab.title')}
      actions={
        <IconButton
          icon="search"
          variant="outlined"
          accessibilityLabel={t('learn.tab.search')}
          onPress={() => router.push('/search')}
        />
      }
    >
      <GradePicker value={grade} ownGrade={ownGrade} onChange={setGrade} />
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : hive ? (
        <View className="gap-3">
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
        </View>
      ) : (
        <GradeEmpty grade={grade} ownGrade={ownGrade} onBack={setGrade} />
      )}
    </CollapsingTitle>
  );
}

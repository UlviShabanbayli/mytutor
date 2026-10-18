import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ADMISSION_GROUPS, EXAM_KINDS } from '@mytutor/schemas';
import type { AdmissionGroup, ExamKind } from '@mytutor/types';
import { Button, Icon, Text } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { DEMO_DAYS_LEFT, demoExamSubjects } from '@/features/exam/demo';
import { examDaysLeft, examGoalOf, type ExamGoal } from '@/features/exam/goal';
import { daysLabel, minutesLabel } from '@/features/exam/labels';
import { EXAM_MINUTES, EXAM_TARGETS, useExamStore } from '@/features/exam/store';
import { ChipGroup } from './ChipGroup';
import { ChoiceRow } from './ChoiceRow';
import { ExamSubjectsLine } from './ExamSubjectsLine';
import { FormSection } from './FormSection';

/**
 * Choosing the exam goal: exam kind (and admission group), the optional target result and the
 * daily minutes. Saves the goal to the profile and the plan preferences to the exam store.
 */
export function ExamSetupForm() {
  const { t } = useTranslation();
  const current = examGoalOf(useAppStore((s) => s.profile.goal));
  const updateProfile = useAppStore((s) => s.updateProfile);
  const prefs = useExamStore();
  const [exam, setExam] = useState<ExamKind | null>(current?.exam ?? null);
  const [group, setGroup] = useState<AdmissionGroup | null>(current?.group ?? null);
  const [target, setTarget] = useState(prefs.target);
  const [minutes, setMinutes] = useState(prefs.minutesPerDay);
  const complete = exam !== null && (exam !== 'admission' || group !== null);

  const draft: ExamGoal | null = exam
    ? {
        kind: 'exam',
        exam,
        group: exam === 'admission' ? group : null,
        date: current?.exam === exam ? current.date : null,
      }
    : null;

  const save = () => {
    if (!draft || !complete) return;
    updateProfile({ goal: draft });
    prefs.setPlanPrefs({ target, minutesPerDay: minutes });
    if (router.canGoBack()) router.back();
    else router.replace('/exam');
  };

  return (
    <View className="flex-1 gap-3.5">
      <FormSection label={t('exam.setup.examLabel')}>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t('exam.setup.examLabel')}
          className="gap-1.5"
        >
          {EXAM_KINDS.map((kind) => (
            <ChoiceRow
              key={kind}
              title={t(`exam.kinds.${kind}`)}
              subtitle={t(`exam.setup.kindSub.${kind}`)}
              selected={exam === kind}
              onPress={() => setExam(kind)}
            />
          ))}
        </View>
      </FormSection>

      {exam === 'admission' ? (
        <FormSection label={t('exam.setup.groupLabel')}>
          <ChipGroup
            accessibilityLabel={t('exam.setup.groupA11y')}
            chips={ADMISSION_GROUPS.map((g) => ({
              value: g,
              label: g,
              accessibilityLabel: t('exam.setup.groupItem', { group: g }),
            }))}
            value={group}
            onChange={setGroup}
          />
        </FormSection>
      ) : null}
      {exam && (exam !== 'admission' || group) ? (
        <ExamSubjectsLine subjects={demoExamSubjects(exam, group)} />
      ) : null}

      {draft ? (
        <View
          accessible
          accessibilityLabel={t('exam.setup.dateA11y')}
          className="flex-row items-center gap-3 rounded-lg bg-info-bg px-3 py-2.5"
        >
          <Icon name="calendar" size={24} color="info" />
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="font-sans-black text-base">
              {t('exam.setup.dateTitle', {
                days: daysLabel(t, examDaysLeft(draft, new Date(), DEMO_DAYS_LEFT)),
              })}
            </Text>
            <Text tone="muted" className="text-xs">
              {t('exam.setup.dateBody')}
            </Text>
          </View>
        </View>
      ) : null}

      <FormSection label={t('exam.setup.targetLabel')}>
        <ChipGroup
          accessibilityLabel={t('exam.setup.targetA11y')}
          chips={EXAM_TARGETS.map((v) => ({ value: v, label: t(`exam.targets.${v}`) }))}
          value={target}
          onChange={setTarget}
        />
      </FormSection>

      <FormSection label={t('exam.setup.timeLabel')}>
        <ChipGroup
          accessibilityLabel={t('exam.setup.timeA11y')}
          chips={EXAM_MINUTES.map((v) => ({ value: v, label: minutesLabel(t, v) }))}
          value={minutes}
          onChange={setMinutes}
        />
      </FormSection>

      <View className="min-h-2 flex-1" />
      <View className="gap-1.5">
        <Button label={t('exam.setup.cta')} disabled={!complete} onPress={save} />
        <Text tone="muted" className="text-center text-xs">
          {complete ? t('exam.setup.note') : t('exam.setup.pickExam')}
        </Text>
      </View>
    </View>
  );
}

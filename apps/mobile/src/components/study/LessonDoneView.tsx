import { useEffect } from 'react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Icon, Text } from '@/components/ui';
import { leaveTo } from '@/features/study/leave';
import type { StudyLesson } from '@/features/study/types';
import { playCue } from '@/lib/cues';
import { CellChange } from './CellChange';

type LessonDoneViewProps = {
  lesson: StudyLesson;
  /** Minutes the four steps took; null when unknown (the screen was opened directly). */
  minutes: number | null;
  /** Questions in the topic test, for "Növbəti: mövzu testi · 5 sual". */
  questions: number;
};

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 gap-0.5 rounded-xl bg-white/45 px-3 py-2.5">
      <Text className="font-display-black text-xl text-on-honey">{value}</Text>
      <Text className="font-sans-bold text-sm text-on-honey">{label}</Text>
    </View>
  );
}

/** "Dərs bitdi!": the honey page — the cell fills with nectar and the topic test is next. */
export function LessonDoneView({ lesson, minutes, questions }: LessonDoneViewProps) {
  const { t } = useTranslation();
  useEffect(() => {
    playCue('complete');
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-honey">
      <View className="flex-1 items-center gap-3 px-6 pb-2 pt-8">
        <Text className="text-center font-sans-black text-sm uppercase tracking-[1.3px] text-on-honey">
          {`${lesson.topicCode} · ${lesson.topicTitle}`}
        </Text>
        <Mascot moment="lessonDone" size={170} decorative />
        <Text variant="title" className="text-center text-on-honey">
          {t('study.done.title')}
        </Text>
        <Text className="max-w-[310px] text-center text-md text-on-honey">
          {t('study.done.body')}
        </Text>
        <View className="self-stretch">
          <CellChange
            code={lesson.topicCode}
            from="not_started"
            to="lesson_completed"
            accessibilityLabel={t('study.done.cellAria', { code: lesson.topicCode })}
            fromLabel={t('study.done.empty')}
            title={t('study.done.nectar')}
            caption={t('study.done.learning')}
            tone="honey"
          />
        </View>
        <View className="flex-row gap-2.5 self-stretch">
          <Tile
            value={t('study.common.pointsValue', { count: lesson.points })}
            label={t('study.done.points')}
          />
          {minutes !== null ? (
            <Tile
              value={t('study.done.minutes', { count: minutes })}
              label={t('study.done.allSteps')}
            />
          ) : null}
        </View>
        <View className="flex-row items-center gap-2">
          <Icon name="target" size={18} color="on-honey" />
          <Text className="font-sans-bold text-sm text-on-honey">
            {t('study.done.next', {
              questions: t('common.questionsCount', { count: questions }),
              minutes: Math.max(1, Math.ceil(questions * 0.8)),
            })}
          </Text>
        </View>
        <View className="flex-1" />
        <Button
          label={t('study.done.toTest')}
          variant="spot"
          onPress={() => router.replace({ pathname: '/test/[id]', params: { id: lesson.testId } })}
          className="self-stretch"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('study.common.later')}
          onPress={() => leaveTo('/learn')}
          className="min-h-touch items-center justify-center self-stretch rounded-lg active:bg-white/45"
        >
          <Text className="font-sans-bold text-on-honey">{t('study.common.later')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

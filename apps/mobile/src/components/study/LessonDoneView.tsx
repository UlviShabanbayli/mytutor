import { useEffect } from 'react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { FadeUp } from '@/components/feedback/FadeUp';
import { PopIn } from '@/components/feedback/PopIn';
import { lessonDoneB } from '@/components/feedback/timelines';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Icon, Text } from '@/components/ui';
import { leaveTo } from '@/features/study/leave';
import type { LessonView } from '@/features/study/types';
import { playCue } from '@/lib/cues';
import { CellChange } from './CellChange';
import { DoneTile } from './DoneTile';

type LessonDoneViewProps = {
  lesson: LessonView;
  /** Minutes the steps took; null when unknown (the screen was opened directly). */
  minutes: number | null;
  /** Questions in the topic test, for "Növbəti: mövzu testi · 5 sual"; null without a test. */
  questions: number | null;
};

const { mascot, mascotFrom, headsAt, headStagger, tilesAt, tileStagger, ctaAt } = lessonDoneB;
const head = (i: number) => headsAt + i * headStagger;

/**
 * "Dərs bitdi!": the honey page — the cell fills with nectar and the topic test is next.
 * feedback.lessondone B: Vızı springs in, the texts rise, nectar rises in the cell under a moving
 * wave, the stat tiles pop and count, the way on comes last.
 */
export function LessonDoneView({ lesson, minutes, questions }: LessonDoneViewProps) {
  const { t } = useTranslation();
  useEffect(() => {
    playCue('complete');
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-honey">
      <View className="flex-1 items-center gap-3 px-6 pb-2 pt-8">
        <FadeUp delay={head(0)}>
          <Text className="text-center font-sans-black text-sm uppercase tracking-[1.3px] text-on-honey">
            {`${lesson.topicCode} · ${lesson.topicTitle}`}
          </Text>
        </FadeUp>
        <PopIn from={mascotFrom} duration={mascot}>
          {/* vizi.done A inside the spring-in: arms up, a hop with fast wings, a laugh. */}
          <Mascot moment="lessonDone" behavior="done" size={170} decorative />
        </PopIn>
        <FadeUp delay={head(1)} contentClassName="items-center gap-3">
          <Text variant="title" className="text-center text-on-honey">
            {t('study.done.title')}
          </Text>
          <Text className="max-w-[310px] text-center text-md text-on-honey">
            {t('study.done.body')}
          </Text>
        </FadeUp>
        <FadeUp delay={head(2)} className="self-stretch">
          <CellChange
            code={lesson.topicCode}
            from="not_started"
            to="lesson_completed"
            accessibilityLabel={t('study.done.cellAria', { code: lesson.topicCode })}
            fromLabel={t('study.done.empty')}
            title={t('study.done.nectar')}
            caption={t('study.done.learning')}
            tone="honey"
            rising
          />
        </FadeUp>
        <View className="flex-row gap-2.5 self-stretch">
          {lesson.points !== null ? (
            <DoneTile
              value={lesson.points}
              format={(n) => t('study.common.pointsValue', { count: n })}
              label={t('study.done.points')}
              delay={tilesAt}
            />
          ) : null}
          {minutes !== null ? (
            <DoneTile
              value={minutes}
              format={(n) => t('study.done.minutes', { count: n })}
              label={t('study.done.allSteps', { count: lesson.steps.length })}
              delay={tilesAt + tileStagger}
            />
          ) : null}
        </View>
        <FadeUp
          delay={ctaAt}
          fill
          className="flex-1 self-stretch"
          contentClassName="flex-1 items-center gap-3"
        >
          {questions !== null ? (
            <View className="flex-row items-center gap-2">
              <Icon name="target" size={18} color="on-honey" />
              <Text className="font-sans-bold text-sm text-on-honey">
                {t('study.done.next', {
                  questions: t('common.questionsCount', { count: questions }),
                  minutes: Math.max(1, Math.ceil(questions * 0.8)),
                })}
              </Text>
            </View>
          ) : null}
          <View className="flex-1" />
          {questions !== null ? (
            <Button
              label={t('study.done.toTest')}
              variant="spot"
              onPress={() =>
                router.replace({ pathname: '/test/[id]', params: { id: lesson.testId } })
              }
              className="self-stretch"
            />
          ) : (
            <Button
              label={t('study.done.toLearn')}
              variant="spot"
              onPress={() => leaveTo('/learn')}
              className="self-stretch"
            />
          )}
          {questions !== null ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('study.common.later')}
              onPress={() => leaveTo('/learn')}
              className="min-h-touch items-center justify-center self-stretch rounded-lg active:bg-white/45"
            >
              <Text className="font-sans-bold text-on-honey">{t('study.common.later')}</Text>
            </Pressable>
          ) : null}
        </FadeUp>
      </View>
    </SafeAreaView>
  );
}

import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, SourceLine, Text } from '@/components/ui';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import type { StudyLesson } from '@/features/study/types';
import { Kicker } from './Kicker';
import { StepLayout } from './StepLayout';

type LessonVideoStepProps = {
  lesson: StudyLesson;
  onNext: () => void;
};

/** Step 1: the whiteboard video, its title and what the lesson covers. */
export function LessonVideoStep({ lesson, onNext }: LessonVideoStepProps) {
  const { t } = useTranslation();
  const { video } = lesson;

  return (
    <StepLayout footer={<Button label={t('study.common.continue')} onPress={onNext} />}>
      <Kicker>{`${lesson.topicCode} · ${lesson.topicTitle}`}</Kicker>
      <VideoPlayer source={video.source} board={video.board} resumeKey={lesson.id} />
      <View className="gap-1 pt-1">
        <Text variant="heading" className="font-display-black text-xl">
          {video.title}
        </Text>
        <Text variant="caption" tone="muted">
          {t('study.lesson.videoMeta', { minutes: video.minutes })}
        </Text>
      </View>
      <View className="gap-1.5 rounded-lg bg-raised px-3.5 py-3">
        <Text variant="overline" tone="honey">
          {t('study.lesson.inThisLesson')}
        </Text>
        <Text className="font-sans-medium">{video.summary}</Text>
      </View>
      <SourceLine source={lesson.source} />
    </StepLayout>
  );
}

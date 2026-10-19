import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { VideoPoster } from './VideoPoster';
import { VideoSurface } from './VideoSurface';

type VideoPlayerProps = {
  /** HLS or MP4 address; null while the video is being prepared. */
  source: string | null;
  board: { heading: string; formula: string };
  /** Where the position is saved, so playback resumes (the lesson id). */
  resumeKey: string;
};

/**
 * All playback goes through here (CLAUDE.md: expo-video). Without a file yet it shows the
 * board poster and a calm "Video hazırlanır" instead of a broken player.
 */
export function VideoPlayer({ source, board, resumeKey }: VideoPlayerProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('study.video.label')}
      className="overflow-hidden rounded-xl bg-spot"
    >
      {source ? (
        <VideoSurface source={source} resumeKey={resumeKey} />
      ) : (
        <>
          <VideoPoster board={board} message={t('study.video.preparing')} />
          <View className="min-h-touch flex-row items-center gap-2.5 px-3.5 py-2.5">
            <Icon name="video" size={20} color="honey" />
            <Text className="flex-1 font-sans-semibold text-sm text-on-spot">
              {t('study.video.preparingBody')}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer, type VideoPlayer, VideoView } from 'expo-video';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { useStudyStore } from '@/features/study/studyStore';
import { PlayerControls } from './PlayerControls';
import { SeekBar } from './SeekBar';

const RATES = [1, 1.25, 1.5, 0.75];

// The player is a native object driven by assignment (expo-video's API); these helpers keep
// that outside the component, where React's rules treat hook results as read-only.
const seek = (player: VideoPlayer, seconds: number) => {
  player.currentTime = seconds;
};
const showCaptions = (player: VideoPlayer, on: boolean) => {
  player.subtitleTrack = on ? (player.availableSubtitleTracks[0] ?? null) : null;
};
const setPlaybackRate = (player: VideoPlayer, rate: number) => {
  player.playbackRate = rate;
};

type VideoSurfaceProps = {
  source: string;
  /** Key of the saved position (the lesson id). */
  resumeKey: string;
};

/** expo-video playback with the design's own controls; resumes where the student left off. */
export function VideoSurface({ source, resumeKey }: VideoSurfaceProps) {
  const { t } = useTranslation();
  const view = useRef<VideoView>(null);
  const setPosition = useStudyStore((s) => s.setVideoPosition);
  const player = useVideoPlayer(source, (p) => {
    p.timeUpdateEventInterval = 1;
    p.currentTime = useStudyStore.getState().videoPositions[resumeKey] ?? 0;
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const [time, setTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [captionsAvailable, setCaptionsAvailable] = useState(false);
  const [rate, setRate] = useState(1);

  useEventListener(player, 'timeUpdate', (e) => {
    setTime(e.currentTime);
    setBuffered(e.bufferedPosition);
    setPosition(resumeKey, e.currentTime);
  });
  useEventListener(player, 'sourceLoad', (e) => {
    setDuration(e.duration);
    setCaptionsAvailable(e.availableSubtitleTracks.length > 0);
  });

  return (
    <>
      <View className="aspect-video w-full bg-spot">
        {/* VideoView takes no className; it fills the 16:9 frame. */}
        <VideoView
          ref={view}
          player={player}
          nativeControls={false}
          contentFit="contain"
          allowsPictureInPicture
          style={StyleSheet.absoluteFill}
        />
        {status === 'error' ? (
          <View accessibilityRole="alert" className="absolute inset-x-3 bottom-2.5 items-center">
            <Text className="rounded-sm bg-spot px-2.5 py-1 text-center font-sans-semibold text-sm text-on-spot">
              {t('study.video.error')}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="gap-0.5 px-2 pb-1.5 pt-2">
        <SeekBar
          time={time}
          buffered={buffered}
          duration={duration}
          onSeek={(seconds) => {
            seek(player, Math.max(0, Math.min(duration, seconds)));
          }}
        />
        <PlayerControls
          playing={isPlaying}
          time={time}
          duration={duration}
          captionsOn={captionsOn}
          captionsAvailable={captionsAvailable}
          rate={rate}
          onTogglePlay={() => (isPlaying ? player.pause() : player.play())}
          onToggleCaptions={() => {
            showCaptions(player, !captionsOn);
            setCaptionsOn(!captionsOn);
          }}
          onNextRate={() => {
            const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length] ?? 1;
            setPlaybackRate(player, next);
            setRate(next);
          }}
          onPictureInPicture={() => void view.current?.startPictureInPicture()}
          onFullscreen={() => void view.current?.enterFullscreen()}
        />
      </View>
    </>
  );
}

import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { formatClock } from '@/features/study/time';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

type PlayerControlsProps = {
  playing: boolean;
  time: number;
  duration: number;
  captionsOn: boolean;
  captionsAvailable: boolean;
  rate: number;
  onTogglePlay: () => void;
  onToggleCaptions: () => void;
  onNextRate: () => void;
  onPictureInPicture: () => void;
  onFullscreen: () => void;
};

type ControlProps = {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

function Control({ label, onPress, selected, disabled = false, children }: ControlProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'min-h-touch min-w-touch items-center justify-center rounded-md active:bg-spot-line',
        disabled && 'opacity-40',
      )}
    >
      {children}
    </Pressable>
  );
}

/** Play/pause, time, captions, speed, picture-in-picture and fullscreen on the dark player bar. */
export function PlayerControls(props: PlayerControlsProps) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const svg = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: c['on-spot'],
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <View className="flex-row items-center gap-0.5">
      <Control
        label={props.playing ? t('study.video.pause') : t('study.video.play')}
        onPress={props.onTogglePlay}
      >
        <Icon name={props.playing ? 'pause' : 'play'} size={22} color="on-spot" />
      </Control>
      <Text className="pl-0.5 font-sans-bold text-sm text-on-spot">
        {formatClock(props.time)}
        <Text className="font-sans-bold text-sm text-on-spot opacity-60">{` / ${formatClock(props.duration)}`}</Text>
      </Text>
      <View className="flex-1" />
      <Control
        label={t('study.video.captions')}
        selected={props.captionsOn}
        disabled={!props.captionsAvailable}
        onPress={props.onToggleCaptions}
      >
        <View
          className={cn(
            'rounded border-2 px-1',
            props.captionsOn ? 'border-honey' : 'border-on-spot',
          )}
        >
          <Text
            className={cn(
              'font-sans-black text-2xs',
              props.captionsOn ? 'text-honey' : 'text-on-spot',
            )}
          >
            {t('study.video.captionsGlyph')}
          </Text>
        </View>
      </Control>
      <Control label={t('study.video.speed', { rate: props.rate })} onPress={props.onNextRate}>
        <Text className="font-sans-black text-sm text-on-spot">
          {t('study.video.rate', { rate: props.rate })}
        </Text>
      </Control>
      <Control label={t('study.video.pip')} onPress={props.onPictureInPicture}>
        <Svg {...svg}>
          <Rect x={3} y={5} width={18} height={14} rx={2.5} />
          <Rect x={12} y={12} width={6.5} height={4.5} rx={1} />
        </Svg>
      </Control>
      <Control label={t('study.video.fullscreen')} onPress={props.onFullscreen}>
        <Svg {...svg}>
          <Path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </Svg>
      </Control>
    </View>
  );
}

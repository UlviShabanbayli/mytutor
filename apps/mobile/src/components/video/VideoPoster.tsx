import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

type VideoPosterProps = {
  board: { heading: string; formula: string };
  /** Shown over the board: "Video hazırlanır" while there is no video file yet. */
  message?: string;
};

/**
 * The whiteboard frame of a lesson video. The board stays white in both schemes, like the
 * rendered video itself; `on-honey` is the near-black marker ink in both.
 */
export function VideoPoster({ board, message }: VideoPosterProps) {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('study.video.board', { formula: board.formula })}
      className="aspect-video w-full justify-center gap-3 bg-white px-5"
    >
      <View className="gap-1 self-start">
        <Text className="font-sans-bold text-md text-on-honey">{board.heading}</Text>
        <View className="h-[3px] w-16 rounded-full bg-honey" />
      </View>
      <Text className="font-sans-semibold text-lg text-on-honey">{board.formula}</Text>
      {message ? (
        <View className="absolute inset-x-3 bottom-2.5 items-center">
          <View className="flex-row items-center gap-1.5 rounded-sm bg-spot px-2.5 py-1">
            <Icon name="clock" size={16} color="honey" />
            <Text className="font-sans-semibold text-sm text-on-spot">{message}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

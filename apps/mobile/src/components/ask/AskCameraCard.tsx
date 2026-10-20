import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, Text, useRaisedPress } from '@/components/ui';
import { ANSWER_MINUTES } from '@/features/ask/subjects';
import { HexBadge } from './HexBadge';

type AskCameraCardProps = {
  online: boolean;
};

function Chip({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View className="h-7 flex-row items-center gap-1.5 rounded-full border border-spot-line px-2.5">
      <Icon name={icon} size={15} color="on-spot" />
      <Text className="font-sans-bold text-sm text-on-spot">{label}</Text>
    </View>
  );
}

/** The main action of the tab: photograph a question (works offline too, it waits). */
export function AskCameraCard({ online }: AskCameraCardProps) {
  const press = useRaisedPress({ depth: 4, calm: true });
  const { t } = useTranslation();

  return (
    <Pressable
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      accessibilityRole="button"
      accessibilityLabel={
        online
          ? t('ask.home.cameraA11y', { minutes: ANSWER_MINUTES.teacher })
          : t('ask.home.cameraA11yOffline')
      }
      onPress={() => router.push('/ask/camera')}
      className="rounded-2xl bg-honey-deep pb-1"
    >
      <Animated.View style={press.faceStyle}>
        <View className="gap-3 rounded-2xl bg-spot p-4">
          <View className="flex-row items-center gap-3.5">
            <HexBadge icon="camera" />
            <View className="min-w-0 flex-1 gap-1">
              <Text className="font-display-black text-lg text-on-spot">
                {t('ask.home.cameraTitle')}
              </Text>
              <Text className="text-on-spot/85">{t('ask.home.cameraBody')}</Text>
            </View>
            <Icon name="chevron" size={22} color="honey" />
          </View>
          <View className="flex-row flex-wrap gap-2">
            {online ? (
              <>
                <Chip
                  icon="clock"
                  label={t('ask.home.chipTime', { minutes: ANSWER_MINUTES.teacher })}
                />
                <Chip icon="check" label={t('ask.home.chipTeacher')} />
              </>
            ) : (
              <Chip icon="clock" label={t('ask.home.chipQueued')} />
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

const round = 'h-[44px] w-[44px] items-center justify-center rounded-full bg-spot-line';

type CameraTopBarProps = {
  /** The torch switch state; null where there is no torch (browsers). */
  torch: boolean | null;
  onTorch: () => void;
};

/** Close, the camera's title and the torch switch, on the dark camera ground. */
export function CameraTopBar({ torch, onTorch }: CameraTopBarProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-2 px-3 pb-2 pt-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={router.back}
        className={round}
      >
        <Icon name="close" size={22} color="on-spot" />
      </Pressable>
      <Text className="flex-1 text-center font-sans-black text-on-spot">
        {t('ask.camera.title')}
      </Text>
      {torch !== null ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={t('ask.camera.torch')}
          accessibilityState={{ checked: torch }}
          onPress={onTorch}
          className={cn(round, torch && 'bg-honey')}
        >
          <Icon name="flash" size={22} color={torch ? 'on-honey' : 'on-spot'} />
        </Pressable>
      ) : (
        <View className="w-[44px]" />
      )}
    </View>
  );
}

import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import type { MascotMood } from '@/components/mascot/moodArt';
import { IconButton, Text } from '@/components/ui';
import { HexBadge } from '../HexBadge';

type ChatHeaderProps = {
  /** Vızı's face follows the conversation: explaining, thinking, comforting, sleepy. */
  mood: MascotMood;
  onMenu: () => void;
};

/** Vızı's name with the AI mark: it answers only from the textbook. */
export function ChatHeader({ mood, onMenu }: ChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-2 border-b border-border bg-surf px-2 pb-2 pt-2">
      <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={router.back} />
      <View className="h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-lg bg-raised">
        <Mascot mood={mood} size={44} decorative />
      </View>
      <View className="min-w-0 flex-1 gap-px">
        <Text accessibilityRole="header" className="font-display-black text-md">
          {t('ask.chat.title')}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <HexBadge size={10} fill="info" />
          <Text variant="caption" tone="muted" className="flex-1 text-xs">
            {t('ask.chat.subtitle')}
          </Text>
        </View>
      </View>
      <IconButton icon="more" accessibilityLabel={t('ask.chat.menu')} onPress={onMenu} />
    </View>
  );
}

import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ControlProps = {
  icon: IconName;
  label: string;
  accessibilityLabel: string;
  state: 'off' | 'on' | 'accent';
  badge?: number;
  onPress: () => void;
};

function Control({ icon, label, accessibilityLabel, state, badge, onPress }: ControlProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="flex-1 items-center gap-1"
    >
      <View
        className={cn(
          'h-14 w-14 items-center justify-center rounded-[18px]',
          state === 'off' && 'bg-wax',
          state === 'on' && 'border border-border bg-surf',
          state === 'accent' && 'bg-honey',
        )}
      >
        <Icon
          name={icon}
          size={24}
          color={state === 'off' ? 'lock-ink' : state === 'accent' ? 'on-honey' : 'ink'}
        />
        {state === 'off' ? (
          // The red slash marks a closed mic or camera, next to the word in the label.
          <View className="absolute h-[2.5px] w-[30px] -rotate-45 rounded-sm bg-err" />
        ) : null}
        {badge ? (
          <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-err px-1">
            <Text className="font-sans-black text-2xs text-page">{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text className="font-sans-bold text-2xs">{label}</Text>
    </Pressable>
  );
}

type LiveControlsProps = {
  mic: boolean;
  camera: boolean;
  hand: boolean;
  unread: number;
  onMic: () => void;
  onCamera: () => void;
  onHand: () => void;
  onChat: () => void;
};

/** Mic, camera, raise hand and chat of a live lesson; mic and camera start closed. */
export function LiveControls(p: LiveControlsProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row gap-2 px-4 pt-2.5">
      <Control
        icon="mic"
        label={t('me.live.mic')}
        accessibilityLabel={p.mic ? t('me.live.micOn') : t('me.live.micOff')}
        state={p.mic ? 'on' : 'off'}
        onPress={p.onMic}
      />
      <Control
        icon="video"
        label={t('me.live.camera')}
        accessibilityLabel={p.camera ? t('me.live.cameraOn') : t('me.live.cameraOff')}
        state={p.camera ? 'on' : 'off'}
        onPress={p.onCamera}
      />
      <Control
        icon="hand"
        label={p.hand ? t('me.live.handUp') : t('me.live.hand')}
        accessibilityLabel={p.hand ? t('me.live.handLabelUp') : t('me.live.hand')}
        state={p.hand ? 'on' : 'accent'}
        onPress={p.onHand}
      />
      <Control
        icon="chat"
        label={t('me.live.chat')}
        accessibilityLabel={t('me.live.chatLabel', { count: p.unread })}
        state="on"
        badge={p.unread}
        onPress={p.onChat}
      />
    </View>
  );
}

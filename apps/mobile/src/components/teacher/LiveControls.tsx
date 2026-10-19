import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { CountDot } from './CountDot';

type LiveControlsProps = {
  mic: boolean;
  sharing: boolean;
  chatUnread: number;
  onMic: () => void;
  onMuteAll: () => void;
  onShare: () => void;
  onChat: () => void;
  onEnd: () => void;
};

/** The room's bottom bar: microphone, mute everyone, share screen, chat, end. */
export function LiveControls(p: LiveControlsProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const items: {
    icon: IconName;
    label: string;
    onPress: () => void;
    pressed?: boolean;
    spoken?: string;
    count?: number;
    end?: boolean;
  }[] = [
    { icon: 'mic', label: t('teacher.live.mic'), onPress: p.onMic, pressed: p.mic },
    { icon: 'volume', label: t('teacher.live.muteAll'), onPress: p.onMuteAll },
    { icon: 'grid', label: t('teacher.live.share'), onPress: p.onShare, pressed: p.sharing },
    {
      icon: 'chat',
      label: t('teacher.live.chat'),
      onPress: p.onChat,
      spoken: t('teacher.live.chatLabel', { count: p.chatUnread }),
      count: p.chatUnread,
    },
    { icon: 'close', label: t('teacher.live.end'), onPress: p.onEnd, end: true },
  ];

  return (
    <View
      accessibilityLabel={t('teacher.live.controls')}
      className="flex-row gap-1 border-t border-border bg-surf px-2.5 pt-2"
      // The home indicator inset is device-specific, so it cannot be a static className.
      style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
    >
      {items.map((x) => (
        <Pressable
          key={x.label}
          accessibilityRole="button"
          accessibilityLabel={x.spoken ?? x.label}
          accessibilityState={x.pressed === undefined ? undefined : { selected: x.pressed }}
          onPress={x.onPress}
          className="flex-1 items-center gap-1"
        >
          {({ pressed }) => (
            <>
              <View
                className={cn(
                  'h-[44px] w-[48px] items-center justify-center rounded-md',
                  x.end ? 'bg-err' : x.pressed === false ? 'bg-wax' : 'bg-raised',
                  pressed && 'opacity-70',
                )}
              >
                <Icon
                  name={x.icon}
                  size={22}
                  color={x.end ? 'surf' : x.pressed === false ? 'muted' : 'ink'}
                />
                {x.count ? (
                  <View className="absolute right-0.5 top-0.5">
                    <CountDot count={x.count} />
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                className={cn(
                  'text-2xs',
                  x.end ? 'font-sans-black text-err' : 'font-sans-bold text-ink',
                )}
              >
                {x.label}
              </Text>
            </>
          )}
        </Pressable>
      ))}
    </View>
  );
}

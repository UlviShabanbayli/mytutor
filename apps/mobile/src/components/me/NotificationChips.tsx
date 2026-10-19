import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SwitchTrack, Text } from '@/components/ui';
import { NOTIFICATION_KINDS, useSettingsStore } from '@/features/me/settingsStore';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';

/** Four notification kinds as switch chips in a 2×2 grid (design "Bildirişlər"). */
export function NotificationChips() {
  const { t } = useTranslation();
  const notifications = useSettingsStore((s) => s.notifications);
  const setNotification = useSettingsStore((s) => s.setNotification);

  return (
    <View className="flex-row flex-wrap gap-1.5">
      {NOTIFICATION_KINDS.map((kind) => {
        const on = notifications[kind];
        return (
          <Pressable
            key={kind}
            accessibilityRole="switch"
            accessibilityState={{ checked: on }}
            accessibilityLabel={t(`me.settings.notif.${kind}`)}
            onPress={() => {
              playCue('press');
              setNotification(kind, !on);
            }}
            className={cn(
              'min-h-11 grow basis-[45%] flex-row items-center gap-1.5 rounded-[12px] border border-border px-2.5',
              on && 'bg-raised',
            )}
          >
            <Text className="flex-1 font-sans-bold text-sm">{t(`me.settings.notif.${kind}`)}</Text>
            <SwitchTrack on={on} size="mini" />
          </Pressable>
        );
      })}
    </View>
  );
}

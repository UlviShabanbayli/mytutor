import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Icon, IconButton, type IconName, Text } from '@/components/ui';

type CameraPermissionProps = {
  /** The system will not ask again: only the phone settings can turn the camera on. */
  blocked: boolean;
  onAllow: () => void;
  onOpenSettings: () => void;
  onPickFromGallery: () => void;
};

function Reason({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View className="flex-row items-center gap-3 rounded-lg border border-border bg-surf px-3 py-2.5">
      <View className="h-10 w-10 items-center justify-center rounded-md bg-raised">
        <Icon name={icon} size={22} color="honey-text" />
      </View>
      <Text className="flex-1 font-sans-semibold">{text}</Text>
    </View>
  );
}

/** Before the camera: why it is needed and who sees the photo; the gallery always works. */
export function CameraPermission({
  blocked,
  onAllow,
  onOpenSettings,
  onPickFromGallery,
}: CameraPermissionProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-page">
      <View className="px-2 pt-2">
        <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={router.back} />
      </View>
      <ScrollView className="flex-1" contentContainerClassName="items-center gap-3 px-6 pb-2">
        <Mascot mood="kesfiyyat" size={150} decorative />
        <Text variant="heading" className="text-center text-2xl">
          {t('ask.camera.permissionTitle')}
        </Text>
        <Text tone="muted" className="text-center">
          {blocked ? t('ask.camera.permissionDenied') : t('ask.camera.permissionBody')}
        </Text>
        <View className="mt-2 w-full gap-2.5">
          <Reason icon="camera" text={t('ask.camera.permissionOnlyOnTap')} />
          <Reason icon="eye" text={t('ask.camera.permissionWhoSees')} />
          <Reason icon="settings" text={t('ask.camera.permissionRevoke')} />
        </View>
      </ScrollView>
      <View className="gap-2 px-4 pb-2 pt-3">
        {blocked ? (
          <Button label={t('ask.camera.openSettings')} icon="settings" onPress={onOpenSettings} />
        ) : (
          <Button label={t('ask.camera.allow')} icon="camera" onPress={onAllow} />
        )}
        <Button
          label={t('ask.camera.fromGallery')}
          variant="secondary"
          icon="image"
          onPress={onPickFromGallery}
        />
      </View>
    </SafeAreaView>
  );
}

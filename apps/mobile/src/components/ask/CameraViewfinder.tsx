import { useRef, useState } from 'react';
import { CameraView } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { AccessibilityInfo, Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner, Icon, Text } from '@/components/ui';
import type { PickedPhoto } from '@/features/ask/photo';
import { cn } from '@/lib/cn';
import { playCue } from '@/lib/cues';
import { CameraTipsSheet } from './CameraTipsSheet';
import { CameraTopBar } from './CameraTopBar';
import { CaptureSheet } from './CaptureSheet';
import { ViewfinderGuide } from './ViewfinderGuide';

type CameraViewfinderProps = {
  onCapture: (photo: PickedPhoto) => void;
  onPickFromGallery: () => void;
};

/**
 * The live camera on the dark `spot` ground: frame guide, shutter, gallery and tips. A shot
 * has no flash: the outside of the frame darkens, the frame snaps, and the photo waits in a
 * sheet to be retaken or cropped (micro.camera C).
 */
export function CameraViewfinder({ onCapture, onPickFromGallery }: CameraViewfinderProps) {
  const { t } = useTranslation();
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tips, setTips] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shot, setShot] = useState<PickedPhoto | null>(null);
  const [snap, setSnap] = useState(0);
  // Browsers expose no torch control, so the button would do nothing there.
  const hasTorch = Platform.OS !== 'web';

  async function shoot() {
    if (!camera.current || !ready || busy || shot) return;
    playCue('press');
    setSnap((n) => n + 1);
    setBusy(true);
    setError(null);
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.8 });
      setShot({ uri: picture.uri, width: picture.width, height: picture.height });
      AccessibilityInfo.announceForAccessibility(t('ask.camera.readyA11y'));
    } catch {
      setError(t('ask.camera.captureError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-spot">
      <StatusBar style="light" />
      <CameraTopBar torch={hasTorch ? torch : null} onTorch={() => setTorch((on) => !on)} />
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('ask.camera.viewfinder')}
        className="mx-3 flex-1 overflow-hidden rounded-2xl border border-spot-line"
      >
        <CameraView
          ref={camera}
          facing="back"
          enableTorch={torch}
          // No white flash: the frame and the darker scrim mark the shot instead.
          animateShutter={false}
          onCameraReady={() => setReady(true)}
          onMountError={() => setError(t('ask.camera.unavailable'))}
          // A native camera view: NativeWind's className does not reach it.
          style={{ flex: 1 }}
        />
        <ViewfinderGuide dim={busy || shot !== null} snap={snap} />
      </View>

      <View className="items-center gap-2 px-4 pt-3">
        {error ? (
          <Banner kind="error" message={error} className="self-stretch" />
        ) : (
          <View
            accessibilityRole="text"
            className="h-9 flex-row items-center gap-2 rounded-full bg-spot-line px-3.5"
          >
            <Icon name="target" size={18} color="honey" />
            <Text className="font-sans-bold text-on-spot">{t('ask.camera.hint')}</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between px-7 pb-2 pt-3.5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ask.camera.fromGallery')}
          onPress={onPickFromGallery}
          className="h-[52px] w-[52px] items-center justify-center rounded-md border-2 border-on-spot"
        >
          <Icon name="image" size={24} color="on-spot" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ask.camera.shoot')}
          accessibilityState={{ disabled: !ready || busy, busy }}
          disabled={!ready || busy}
          onPress={() => void shoot()}
          className="h-[82px] w-[82px] items-center justify-center rounded-full border-[5px] border-on-spot"
        >
          {({ pressed }) => (
            <View
              className={cn(
                'h-[62px] w-[62px] rounded-full bg-honey',
                (pressed || busy) && 'scale-90',
                !ready && 'opacity-50',
              )}
            />
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ask.camera.tips')}
          onPress={() => setTips(true)}
          className="h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-spot-line"
        >
          <Icon name="info" size={24} color="on-spot" />
        </Pressable>
      </View>
      {shot ? (
        <CaptureSheet
          uri={shot.uri}
          onRetake={() => setShot(null)}
          onContinue={() => onCapture(shot)}
        />
      ) : null}
      <CameraTipsSheet visible={tips} onClose={() => setTips(false)} />
    </SafeAreaView>
  );
}

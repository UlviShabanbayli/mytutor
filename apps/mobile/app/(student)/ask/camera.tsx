import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Linking, View } from 'react-native';
import { CameraPermission } from '@/components/ask/CameraPermission';
import { CameraViewfinder } from '@/components/ask/CameraViewfinder';
import { pickFromGallery, type PickedPhoto } from '@/features/ask/photo';
import { useAskStore } from '@/features/ask/store';

/** Camera (permission state first), or the gallery; the photo goes on to cropping. */
export default function AskCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const setPhoto = useAskStore((s) => s.setPhoto);

  function toCrop(photo: PickedPhoto) {
    setPhoto(photo);
    router.replace('/ask/crop');
  }

  async function gallery() {
    const photo = await pickFromGallery();
    if (photo) toCrop(photo);
  }

  // The permission state is read once on mount; until then the dark camera ground stays.
  if (!permission) return <View className="flex-1 bg-spot" />;

  if (!permission.granted) {
    return (
      <CameraPermission
        blocked={!permission.canAskAgain}
        onAllow={() => void requestPermission()}
        onOpenSettings={() => void Linking.openSettings()}
        onPickFromGallery={() => void gallery()}
      />
    );
  }

  return <CameraViewfinder onCapture={toCrop} onPickFromGallery={() => void gallery()} />;
}

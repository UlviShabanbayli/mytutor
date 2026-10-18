import { useState } from 'react';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DEFAULT_CROP } from '@/features/ask/crop';
import type { CropRect, PhotoDraft } from '@/features/ask/types';
import { CropFrame } from './CropFrame';

type CropEditorProps = {
  draft: PhotoDraft;
  /** The frame is shown while the "Kəs" tool is on. */
  cropping: boolean;
  onCropChange: (crop: CropRect) => void;
};

/**
 * The photo turned by the chosen rotation, with the crop frame over it. The frame is kept as
 * fractions and sent with the original photo; the server cuts it (no image library on device).
 */
export function CropEditor({ draft, cropping, onCropChange }: CropEditorProps) {
  const { t } = useTranslation();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [rect, setRect] = useState<CropRect>(draft.crop ?? DEFAULT_CROP);
  const sideways = draft.rotation % 180 !== 0;
  // A photo turned sideways must shrink to stay inside the area.
  const scale = size && sideways ? Math.min(size.width / size.height, size.height / size.width) : 1;

  return (
    <View
      accessible={!cropping}
      accessibilityRole="image"
      accessibilityLabel={t('ask.crop.photo')}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
      className="flex-1 overflow-hidden rounded-xl bg-cap"
    >
      <Image
        source={{ uri: draft.uri }}
        resizeMode="contain"
        className="h-full w-full"
        // The rotation is the student's choice, so it cannot be a static className.
        style={{ transform: [{ rotate: `${draft.rotation}deg` }, { scale }] }}
      />
      {cropping && size ? (
        <CropFrame
          rect={rect}
          width={size.width}
          height={size.height}
          onChange={setRect}
          onCommit={onCropChange}
        />
      ) : null}
    </View>
  );
}

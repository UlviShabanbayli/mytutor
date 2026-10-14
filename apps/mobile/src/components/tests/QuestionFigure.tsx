import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiUrl } from '@/lib/api';

/** A picture the question needs, as wide as the screen allows and in its own proportions. */
export function QuestionFigure({ path }: { path: string }) {
  const { t } = useTranslation();
  const uri = apiUrl(path);
  const [ratio, setRatio] = useState<number | null>(null);
  useEffect(() => {
    Image.getSize(uri, (width, height) => setRatio(width / Math.max(height, 1)));
  }, [uri]);
  return (
    <View className="overflow-hidden rounded-md border border-border bg-white">
      <Image
        source={{ uri }}
        accessibilityLabel={t('session.figure')}
        resizeMode="contain"
        className="w-full"
        // The proportion is the picture's own, known only once it loads.
        style={{ aspectRatio: ratio ?? 4 / 3 }}
      />
    </View>
  );
}

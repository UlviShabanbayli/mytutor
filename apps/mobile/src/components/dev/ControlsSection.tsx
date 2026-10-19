import { useState } from 'react';
import { View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  Input,
  ProgressBar,
  SegmentedControl,
  Sheet,
  Text,
} from '@/components/ui';
import { type ThemePreference, useThemeStore } from '@/features/settings/themeStore';
import { GallerySection } from './GallerySection';

const SCHEMES = [
  { value: 'light', label: 'Light', icon: 'today' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'phone' },
] as const;

/** Type scale, buttons, fields, progress, segmented control and the bottom sheet. */
export function ControlsSection() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const [sheet, setSheet] = useState(false);

  return (
    <>
      <GallerySection title="Scheme">
        <SegmentedControl<ThemePreference>
          segments={SCHEMES}
          value={preference}
          onChange={setPreference}
          accessibilityLabel="Scheme"
        />
      </GallerySection>
      <GallerySection title="Type">
        <Text variant="title">Riyaziyyat 7</Text>
        <Text variant="heading">Digər fənlər</Text>
        <Text variant="subheading">Cəmin və fərqin kubu</Text>
        <Text>(a + b)² = a² + 2ab + b² · Əə Ğğ Iı İi Öö Üü Şş Çç ₼ · Жж Ыы</Text>
        <Text variant="caption" tone="muted">
          TRİMS dərsliyi · 1-ci hissə
        </Text>
        <Text variant="overline" tone="honey">
          Sənin sinfin üçün
        </Text>
      </GallerySection>
      <GallerySection title="Buttons">
        <Button label="Davam et" />
        <Button label="Davam et" variant="spot" icon="play" />
        <Button label="Yoxla" disabled />
        <Button label="Göndərilir" loading />
        <Button label="İkinci dərəcəli" variant="secondary" size="md" />
        <Button label="Mətn düyməsi" variant="text" size="md" />
        <Button label="Təhlükəli: hesabı sil" variant="danger" size="md" />
      </GallerySection>
      <GallerySection title="Fields and progress">
        <Input
          label="Telefon nömrəsi"
          defaultValue="50 123 45 67"
          prefix={<Text className="font-sans-bold text-md">+994</Text>}
        />
        <Input label="SMS kodu" defaultValue="12" error="Kod səhvdir. Yenidən yoxla." />
        <Card className="gap-2">
          <Text className="font-sans-black text-sm text-honey-text">17 / 26 hüceyrə</Text>
          <ProgressBar value={17 / 26} accessibilityLabel="17 / 26" />
        </Card>
        <View className="flex-row flex-wrap gap-2">
          <Badge label="Hazırlanır" icon="clock" />
          <Badge label="Bal" tone="honey" />
          <Badge label="92%" tone="ok" />
          <Badge label="Gecikib" tone="err" />
          <Badge label="Yeni" tone="info" />
          <Badge label="Təkrar" tone="crystal" />
        </View>
        <Button label="Open sheet" variant="secondary" size="md" onPress={() => setSheet(true)} />
        <Sheet visible={sheet} onClose={() => setSheet(false)} title="4.3 · Cəmin və fərqin kubu">
          <Text tone="muted">Lövhə dərsi + dərslikdən izah · ~7 dəq</Text>
          <Button label="Başla · +15 bal" onPress={() => setSheet(false)} />
        </Sheet>
      </GallerySection>
    </>
  );
}

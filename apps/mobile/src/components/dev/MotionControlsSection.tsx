import { useState } from 'react';
import { View } from 'react-native';
import { GradePicker } from '@/components/onboarding/GradePicker';
import { Button, IconButton, Switch, SwitchTrack, Text } from '@/components/ui';
import { GallerySection } from './GallerySection';
import { HoldDemo } from './HoldDemo';
import { TabBarDemo } from './TabBarDemo';

/** The approved control animations (docs/design/motion.md, "Düymələr və toxunuş") to try out. */
export function MotionControlsSection() {
  const [chosen, setChosen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sound, setSound] = useState(true);
  const [mini, setMini] = useState(false);
  const [grade, setGrade] = useState<number | null>(7);

  return (
    <>
      <GallerySection title="Motion · buttons">
        <Button
          label={chosen ? 'Cavabı geri al' : 'Cavab seç'}
          variant="secondary"
          size="md"
          onPress={() => setChosen((c) => !c)}
        />
        <Button label="Yoxla" disabled={!chosen} onPress={() => setChosen(false)} />
        <Button
          label="Sualı göndər"
          variant="spot"
          icon="send"
          loading={busy}
          onPress={() => {
            setBusy(true);
            setTimeout(() => setBusy(false), 1800);
          }}
        />
        <View className="flex-row items-center gap-2">
          <IconButton icon="back" accessibilityLabel="Geri" onPress={() => undefined} />
          <IconButton icon="close" accessibilityLabel="Bağla" onPress={() => undefined} />
          <View className="flex-1">
            <Button label="Bilirəm, keç" variant="text" size="md" />
          </View>
        </View>
      </GallerySection>
      <GallerySection title="Motion · switch, grade, hold">
        <View className="flex-row items-center gap-3">
          <Text className="flex-1 font-sans-bold">Səs</Text>
          <Switch value={sound} onValueChange={setSound} accessibilityLabel="Səs" />
          <Switch value accessibilityLabel="Bağlı" onValueChange={() => undefined} disabled />
          <Button
            label={mini ? 'Mini: açıq' : 'Mini: bağlı'}
            variant="text"
            size="md"
            onPress={() => setMini((m) => !m)}
          />
          <SwitchTrack on={mini} size="mini" />
        </View>
        <GradePicker value={grade} onChange={setGrade} accessibilityLabel="Sinif" />
        <HoldDemo />
      </GallerySection>
      <GallerySection title="Motion · tab bar and badge">
        <TabBarDemo />
      </GallerySection>
    </>
  );
}

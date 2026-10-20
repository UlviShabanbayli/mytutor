import { useState } from 'react';
import { View } from 'react-native';
import { ViziNarrator, type NarratorWord } from '@/components/mascot/ViziNarrator';
import { ViziReward } from '@/components/mascot/ViziReward';
import { ViziScout, type ScoutCell } from '@/components/mascot/ViziScout';
import { Button, Text } from '@/components/ui';
import { GallerySection } from './GallerySection';

// Sample sentence of the motion lab, one word every 380ms (as TTS word timestamps would be).
const WORDS: NarratorWord[] = 'Cəmin kubunu açanda dörd hədd alırıq.'
  .split(' ')
  .map((text, i) => ({ text, start: 0.3 + i * 0.38, end: 0.3 + (i + 1) * 0.38 }));

const CELLS: ScoutCell[] = [
  { label: '1.5', state: 'reinforced' },
  { label: '2.1', state: 'mastered' },
  { label: '2.2', state: 'needs_practice' },
  { label: '2.3', state: 'mastered' },
  { label: '3.1', state: 'needs_practice' },
];

/** The Vızı scenes with their own pieces: voice-over (explain C), scout (A), gift (reward B). */
export function ViziScenesSection() {
  const [run, setRun] = useState(0);

  return (
    <>
      <GallerySection title="Vızı · explain (word timestamps)">
        <ViziNarrator words={WORDS} size={110} />
      </GallerySection>
      <GallerySection title="Vızı · scout and reward">
        <ViziScout key={`s${run}`} cells={CELLS} found={2}>
          <View className="rounded-xl border border-border bg-surf px-3 py-2.5">
            <Text className="font-sans-bold">Tapdım! 2.2 · Qüvvətlərin vurulması və bölünməsi</Text>
          </View>
        </ViziScout>
        <View className="items-center rounded-xl bg-honey py-4">
          <ViziReward key={`r${run}`} size={130} />
        </View>
        <Button label="Replay" variant="secondary" size="md" onPress={() => setRun((n) => n + 1)} />
      </GallerySection>
    </>
  );
}

import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Mascot, type MascotBehavior } from '@/components/mascot/Mascot';
import { ThinkCells } from '@/components/mascot/scenes/ThinkCells';
import { Button, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { GallerySection } from './GallerySection';

const BEHAVIORS: MascotBehavior[] = [
  'idle',
  'tap',
  'greet',
  'correct',
  'wrong',
  'done',
  'think',
  'loading',
  'sleepy',
  'streak',
];

/** Plays one live Vızı behaviour at a time (Replay remounts it). */
export function ViziMotionSection() {
  const [behavior, setBehavior] = useState<MascotBehavior | 'enter'>('idle');
  const [run, setRun] = useState(0);
  const [visible, setVisible] = useState(true);
  const [recovered, setRecovered] = useState(false);
  const replay = () => {
    setRecovered(false);
    setVisible(true);
    setRun((n) => n + 1);
  };

  return (
    <GallerySection title="Vızı · live behaviours">
      <View className="flex-row flex-wrap gap-1.5">
        {[...BEHAVIORS, 'enter' as const].map((b) => (
          <Pressable
            key={b}
            accessibilityRole="button"
            onPress={() => {
              setBehavior(b);
              replay();
            }}
            className={cn(
              'min-h-11 justify-center rounded-full border px-3',
              b === behavior ? 'border-honey bg-raised' : 'border-border bg-surf',
            )}
          >
            <Text className="font-sans-bold text-sm">{b}</Text>
          </Pressable>
        ))}
      </View>
      <View className="h-[260px] items-center justify-center overflow-hidden rounded-xl border border-border bg-surf">
        {behavior === 'enter' ? (
          <Mascot key={run} moment="greeting" behavior="idle" enter visible={visible} size={140} />
        ) : (
          <View key={`${behavior}${run}`} className="flex-row items-center gap-3">
            <Mascot
              moment="greeting"
              behavior={behavior}
              size={140}
              tappable={behavior === 'greet'}
              say={behavior === 'correct' ? 'Əla!' : behavior === 'greet' ? 'Salam!' : undefined}
              recovered={recovered}
            />
            {behavior === 'think' ? <ThinkCells cell={28} /> : null}
          </View>
        )}
      </View>
      <View className="flex-row gap-2">
        <Button label="Replay" variant="secondary" size="md" onPress={replay} className="flex-1" />
        {behavior === 'enter' ? (
          <Button
            label={visible ? 'Exit' : 'Enter'}
            variant="secondary"
            size="md"
            onPress={() => setVisible((v) => !v)}
            className="flex-1"
          />
        ) : null}
        {behavior === 'streak' ? (
          <Button
            label="Restart"
            variant="secondary"
            size="md"
            onPress={() => setRecovered(true)}
            className="flex-1"
          />
        ) : null}
      </View>
    </GallerySection>
  );
}

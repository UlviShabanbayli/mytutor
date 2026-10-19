import { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  Button,
  Card,
  CodeFlash,
  CopyButton,
  HexCheckbox,
  HexRadio,
  RollingNumber,
  Text,
  TypingHexes,
} from '@/components/ui';
import { GallerySection } from './GallerySection';

const GOALS = ['10 dəq', '20 dəq', '30 dəq'] as const;

/** micro.count, micro.typing, micro.check and micro.copy: the shared micro primitives. */
export function MicroMotionSection() {
  const [points, setPoints] = useState(255);
  const [checks, setChecks] = useState([true, false]);
  const [goal, setGoal] = useState<string>('20 dəq');
  const [flash, setFlash] = useState(0);

  return (
    <>
      <GallerySection title="RollingNumber · micro.count B">
        <Card className="flex-row items-center justify-between gap-3">
          <RollingNumber
            value={points}
            group
            suffix=" bal"
            className="font-display-black text-3xl text-honey-text"
          />
          <Button
            label="+5 bal"
            variant="secondary"
            size="md"
            onPress={() => setPoints((p) => p + 5)}
          />
        </Card>
        <Button
          label="+1 000"
          variant="text"
          size="md"
          onPress={() => setPoints((p) => p + 1000)}
        />
      </GallerySection>
      <GallerySection title="TypingHexes · micro.typing B">
        <View className="flex-row items-center gap-2.5 self-start rounded-xl rounded-bl-[4px] border border-border bg-surf px-3.5 py-3">
          <TypingHexes />
          <Text variant="caption" tone="muted" className="text-sm">
            Vızı düşünür… dərslikdə axtarır
          </Text>
        </View>
      </GallerySection>
      <GallerySection title="HexCheckbox · HexRadio · micro.check C">
        {['Gündəlik xatırlatma', 'Valideynə həftəlik hesabat'].map((label, i) => (
          <Pressable
            key={label}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: checks[i] }}
            onPress={() => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))}
            className="min-h-[44px] flex-row items-center gap-3"
          >
            <HexCheckbox checked={checks[i] ?? false} />
            <Text className="font-sans-bold">{label}</Text>
          </Pressable>
        ))}
        <View accessibilityRole="radiogroup" className="flex-row gap-2">
          {GOALS.map((g) => (
            <Pressable
              key={g}
              accessibilityRole="radio"
              accessibilityState={{ checked: goal === g }}
              onPress={() => setGoal(g)}
              className="min-h-touch flex-1 flex-row items-center justify-center gap-2 rounded-md border-2 border-border bg-surf"
            >
              <HexRadio selected={goal === g} />
              <Text className="font-sans-bold text-sm">{g}</Text>
            </Pressable>
          ))}
        </View>
      </GallerySection>
      <GallerySection title="CopyButton · CodeFlash · micro.copy A">
        <View className="gap-2.5 rounded-xl bg-spot px-4 py-3.5">
          <CodeFlash flash={flash}>
            <Text className="font-display-black text-[26px] leading-[32px] tracking-[1.3px] text-on-spot">
              7B-4KQ2
            </Text>
          </CodeFlash>
          <CopyButton
            text="7B-4KQ2"
            label="Kodu kopyala"
            copiedLabel="Kopyalandı"
            onCopied={() => setFlash((n) => n + 1)}
          />
        </View>
        <View className="flex-row items-center justify-between rounded-xl border border-border bg-surf px-3.5 py-3">
          <Text className="font-display-black text-md">R4T 9KB</Text>
          <CopyButton variant="outline" text="R4T9KB" label="Kopyala" copiedLabel="Kopyalandı" />
        </View>
      </GallerySection>
    </>
  );
}

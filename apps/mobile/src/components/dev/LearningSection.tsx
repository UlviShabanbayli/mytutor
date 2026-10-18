import { View } from 'react-native';
import {
  AnswerOption,
  type AnswerState,
  Banner,
  type CellState,
  HexCell,
  SourceLine,
  StatusPill,
  Text,
} from '@/components/ui';
import { GallerySection } from './GallerySection';

const ANSWERS: [string, string, AnswerState][] = [
  ['A', 'a³ + 8', 'idle'],
  ['B', 'a³ + 6a² + 12a + 8', 'selected'],
  ['C', 'a³ + 6a² + 12a + 8', 'correct'],
  ['D', 'a³ + 3a² + 3a + 8', 'wrong'],
  ['E', 'a³ + 2a² + 4a + 8', 'disabled'],
];

const CELLS: CellState[] = [
  'not_started',
  'lesson_completed',
  'mastered',
  'reinforced',
  'needs_practice',
];

/** Answer states, mastery cells, pills, the source line and banners. */
export function LearningSection() {
  return (
    <>
      <GallerySection title="Answer options">
        {ANSWERS.map(([letter, text, state]) => (
          <AnswerOption
            key={letter}
            letter={letter}
            state={state}
            accessibilityLabel={`${letter}: ${text}`}
            onPress={() => undefined}
          >
            <Text className="font-sans-semibold text-md">{text}</Text>
          </AnswerOption>
        ))}
      </GallerySection>
      <GallerySection title="Mastery cells">
        {[64, 40, 22].map((size) => (
          <View key={size} className="flex-row flex-wrap items-center gap-2">
            {CELLS.map((state) => (
              <HexCell
                key={state}
                state={state}
                size={size}
                label={size > 30 ? '4.3' : undefined}
              />
            ))}
            <HexCell
              state="lesson_completed"
              size={size}
              label={size > 30 ? '4.3' : undefined}
              selected
            />
          </View>
        ))}
      </GallerySection>
      <GallerySection title="Pills, source, banners">
        <View className="flex-row flex-wrap gap-2">
          <StatusPill kind="ai" label="AI cavabı · yoxlanır" />
          <StatusPill kind="teacher" label="Müəllim təsdiqlədi" />
          <StatusPill kind="premium" label="Premium" />
          <StatusPill kind="points" label="+15 bal" />
          <StatusPill kind="soon" label="Hazırlanır" />
        </View>
        <SourceLine source="Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.1 · s. 83" />
        <Banner kind="offline" message="Oflayn: yüklənmiş dərslər işləyir." />
        <Banner
          kind="error"
          message="Göndərmək alınmadı. Yenidən cəhd et."
          actionLabel="Yenidən"
          onAction={() => undefined}
        />
      </GallerySection>
    </>
  );
}

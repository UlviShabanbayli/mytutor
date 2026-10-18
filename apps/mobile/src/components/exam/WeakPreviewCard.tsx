import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { evidenceText } from '@/features/exam/labels';
import type { WeakSpot } from '@/features/exam/types';
import { HexTile, toneOfCell } from './HexTile';
import { SectionLink } from './SectionLink';

type WeakPreviewCardProps = {
  spots: WeakSpot[];
};

const PREVIEW = 2;

/** The two weakest topics on the exam tab; everything opens Vızı's scouting report. */
export function WeakPreviewCard({ spots }: WeakPreviewCardProps) {
  const { t } = useTranslation();
  const open = () => router.push('/exam/weak-spots');

  return (
    <View
      accessibilityLabel={t('exam.home.weakTitle')}
      className="gap-1.5 rounded-xl border border-border bg-surf px-2.5 pb-2.5 pt-1"
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-1.5">
          <Icon name="search" size={18} color="honey-text" />
          <Text className="font-sans-black text-base">{t('exam.home.weakTitle')}</Text>
        </View>
        <SectionLink
          label={t('exam.home.weakAll', { count: spots.length })}
          accessibilityLabel={t('exam.home.weakA11y', { count: spots.length })}
          onPress={open}
        />
      </View>
      {spots.slice(0, PREVIEW).map((spot) => {
        const evidence = evidenceText(t, spot.evidence);
        return (
          <Pressable
            key={spot.id}
            accessibilityRole="button"
            accessibilityLabel={t('exam.weak.rowA11y', {
              topic: spot.topic,
              title: spot.title,
              evidence,
            })}
            onPress={open}
            className="min-h-touch flex-row items-center gap-2.5 rounded-md bg-raised px-2.5 py-1.5 active:opacity-80"
          >
            <HexTile tone={toneOfCell(spot.state)} size={34} label={spot.topic} />
            <View className="min-w-0 flex-1">
              <Text className="font-sans-black text-sm">{spot.short}</Text>
              <Text tone="muted" className="text-xs">
                {evidence}
              </Text>
            </View>
            <Icon name="chevron" size={18} color="muted" />
          </Pressable>
        );
      })}
    </View>
  );
}

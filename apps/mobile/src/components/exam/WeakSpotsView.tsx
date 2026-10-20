import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ViziScout } from '@/components/mascot/ViziScout';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { errorsLabel } from '@/features/exam/labels';
import { scoutRow } from '@/features/exam/scoutRow';
import { useWeakSpots } from '@/features/exam/queries';
import { useExamStore } from '@/features/exam/store';
import { SpeechBubble } from './SpeechBubble';
import { WeakSpotCard } from './WeakSpotCard';

/** Vızı's scouting report: the weak topics, the first one opened with its trail. */
export function WeakSpotsView() {
  const { t } = useTranslation();
  const query = useWeakSpots();
  const chainsInPlan = useExamStore((s) => s.chainsInPlan);
  const addChainToPlan = useExamStore((s) => s.addChainToPlan);
  // undefined: the first spot opens by default; null: the student closed every spot.
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const report = query.data;
  if (!report || report.spots.length === 0)
    return (
      <EmptyState
        moment="weakSpot"
        title={t('exam.weak.emptyTitle')}
        description={t('exam.weak.emptyBody')}
        actionLabel={t('exam.weak.emptyCta')}
        onAction={() => router.push('/exam/mocks')}
      />
    );

  const expandedId = openId === undefined ? report.spots[0]?.id : openId;
  const openPlan = () => router.push('/exam/plan');
  const scout = scoutRow(report.spots);

  return (
    <View className="gap-2.5">
      {/* Vızı scouts the weak topics with its magnifier, then tells what it found (scout A). */}
      <ViziScout cells={scout.cells} found={scout.found}>
        <SpeechBubble
          moment="weakSpot"
          size={68}
          withMascot={false}
          text={t('exam.weak.intro', {
            mocks: report.mocks,
            errors: errorsLabel(t, report.errors),
            root: report.commonRoot ?? '',
          })}
        />
      </ViziScout>
      {report.spots.map((spot) => (
        <WeakSpotCard
          key={spot.id}
          spot={spot}
          expanded={spot.id === expandedId}
          onToggle={() => setOpenId(spot.id === expandedId ? null : spot.id)}
          inPlan={chainsInPlan.includes(spot.id)}
          onFix={() => {
            addChainToPlan(spot.id);
            openPlan();
          }}
          onOpenPlan={openPlan}
        />
      ))}
    </View>
  );
}

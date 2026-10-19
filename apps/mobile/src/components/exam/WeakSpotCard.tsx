import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Icon, Text } from '@/components/ui';
import { evidenceText, minutesLabel, stepsLabel } from '@/features/exam/labels';
import type { WeakSpot } from '@/features/exam/types';
import { cn } from '@/lib/cn';
import { ChainLinkRow } from './ChainLinkRow';
import { HexTile, toneOfCell } from './HexTile';

type WeakSpotCardProps = {
  spot: WeakSpot;
  expanded: boolean;
  onToggle: () => void;
  inPlan: boolean;
  onFix: () => void;
  onOpenPlan: () => void;
};

/** A weak topic; opened, it shows the trail of the mistake back to its root and a fix. */
export function WeakSpotCard({
  spot,
  expanded,
  onToggle,
  inPlan,
  onFix,
  onOpenPlan,
}: WeakSpotCardProps) {
  const { t } = useTranslation();
  const evidence = evidenceText(t, spot.evidence);
  const level = t(`exam.levels.${spot.state}`);

  return (
    <View
      accessibilityLabel={t('exam.weak.spotA11y', { topic: spot.topic, title: spot.title })}
      className={cn(
        'rounded-xl bg-surf',
        expanded ? 'gap-2 border-2 border-honey p-3' : 'border border-border px-3 py-2',
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('exam.weak.rowA11y', {
          topic: spot.topic,
          title: spot.title,
          evidence,
        })}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        className="min-h-touch flex-row items-center gap-2.5"
      >
        <HexTile tone={toneOfCell(spot.state)} size={expanded ? 44 : 40} label={spot.topic} />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="font-sans-black text-base">{spot.title}</Text>
          {expanded ? (
            <Text className="font-sans-bold text-xs text-crystal-ink">
              {t('exam.weak.meta', { evidence, level })}
            </Text>
          ) : (
            <Text tone="muted" className="text-xs">
              {evidence}
            </Text>
          )}
        </View>
        <View className={expanded ? 'rotate-180' : undefined}>
          <Icon name="down" size={20} color="muted" />
        </View>
      </Pressable>

      {expanded ? (
        <>
          <Text variant="overline" tone="muted">
            {t('exam.weak.chainLabel')}
          </Text>
          <View accessibilityLabel={t('exam.weak.chainA11y')}>
            {spot.chain.map((link, i) => (
              <ChainLinkRow key={link.topic} link={link} last={i === spot.chain.length - 1} />
            ))}
          </View>
          {inPlan ? (
            <View className="items-center gap-2">
              <Badge tone="ok" icon="check" label={t('exam.weak.fixed')} />
              <Button
                variant="secondary"
                size="md"
                label={t('exam.weak.openPlan')}
                onPress={onOpenPlan}
                className="self-stretch"
              />
            </View>
          ) : (
            <View className="gap-1.5">
              <Button label={t('exam.weak.fix')} icon="link" onPress={onFix} />
              <Text tone="muted" className="text-center font-sans-semibold text-xs">
                {t('exam.weak.fixMeta', {
                  steps: stepsLabel(t, spot.fixSteps),
                  minutes: minutesLabel(t, spot.fixMinutes),
                })}
              </Text>
            </View>
          )}
        </>
      ) : null}
    </View>
  );
}

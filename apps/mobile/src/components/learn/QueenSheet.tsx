import { router } from 'expo-router';
import { View } from 'react-native';
import { Banner, Button, IconButton, Sheet, Text } from '@/components/ui';
import { isFilled } from '@/features/learn/mastery';
import { openTest } from '@/features/learn/navigation';
import { unitResultOf, useUnitTest } from '@/features/learn/queries';
import type { Hive, HiveUnit } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { LevelPill } from './LevelPill';
import { QueenCell } from './QueenCell';

type QueenSheetProps = {
  hive: Hive;
  unit: HiveUnit;
  unitIndex: number;
  online: boolean;
  onClose: () => void;
};

/** The unit test cell's sheet: start the unit test, or see the sealed frame's result. */
export function QueenSheet({ hive, unit, unitIndex, online, onClose }: QueenSheetProps) {
  const { t, levelAria } = useLearnText();
  const { test } = useUnitTest(hive, unitIndex);
  const level = unit.unitTest.level;
  const result = isFilled(level) ? unitResultOf(unit.id) : undefined;
  const title = t('learn.sheet.queenTitle', { title: unit.title });

  return (
    <Sheet visible onClose={onClose} title={title} showTitle={false}>
      <View className="flex-row items-start gap-3.5">
        <QueenCell level={level} size={58} word={t('learn.hive.queenWord')} />
        <View
          accessible
          accessibilityLabel={`${title}: ${levelAria(level)}`}
          className="min-w-0 flex-1 gap-1.5"
        >
          <Text variant="overline" tone="muted">
            {t('learn.sheet.queenOverline', { unit: unit.number })}
          </Text>
          <Text variant="subheading">{title}</Text>
          <LevelPill level={level} />
        </View>
        <IconButton
          icon="close"
          color="muted"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
        />
      </View>
      <Text tone="muted">
        {result
          ? t('learn.sheet.queenPassed', { correct: result.correct, total: result.total })
          : t('learn.sheet.queenBody')}
      </Text>
      {online ? null : <Banner kind="offline" message={t('learn.sheet.offline')} />}
      <Button
        label={test ? t('learn.sheet.queenStart') : t('learn.step.testPreparing')}
        disabled={!online || !test}
        onPress={() => {
          if (!test) return;
          onClose();
          openTest(test.id);
        }}
      />
      {result ? (
        <Button
          variant="text"
          size="md"
          label={t('learn.sheet.queenResult')}
          onPress={() => {
            onClose();
            router.push({ pathname: '/unit-done/[id]', params: { id: unit.id } });
          }}
        />
      ) : null}
    </Sheet>
  );
}

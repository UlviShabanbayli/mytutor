import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { type CellState, HexCell, Text } from '@/components/ui';
import type { ClassInsights } from '@mytutor/types';
import { MasteryLegend } from './MasteryLegend';
import { SmallButton } from './SmallButton';

const FIRST_ROWS = 6;

type MasteryGridProps = { topics: ClassInsights['topics']; rows: ClassInsights['rows'] };

/** Student × topic levels (M7) with the hive's cell states; long classes fold after six rows. */
export function MasteryGrid({ topics, rows }: MasteryGridProps) {
  const { t } = useTranslation();
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, FIRST_ROWS);
  const level = (s: CellState) => t(`teacher.levels.${s}`);

  return (
    <View
      accessibilityLabel={t('teacher.insights.section')}
      className="gap-0.5 rounded-xl border border-border bg-surf px-3 py-2.5"
    >
      <View accessibilityRole="none" accessibilityLabel={t('teacher.insights.table')}>
        <View className="h-[22px] flex-row items-center gap-1">
          <Text variant="overline" tone="muted" className="flex-1">
            {t('teacher.insights.student')}
          </Text>
          {topics.map((topic) => (
            <Text
              key={topic.id}
              className="w-[38px] text-center font-sans-black text-xs text-muted"
            >
              {topic.number}
            </Text>
          ))}
        </View>
        {shown.map((row) => (
          <View
            key={row.studentId}
            accessible
            accessibilityLabel={[
              row.name,
              ...row.levels.map((s, i) =>
                t('teacher.insights.cell', { topic: topics[i]?.number ?? '', level: level(s) }),
              ),
            ].join(', ')}
            className="h-[40px] flex-row items-center gap-1"
          >
            <Text numberOfLines={1} className="min-w-0 flex-1 font-sans-bold text-sm">
              {row.name}
            </Text>
            {row.levels.map((s, i) => (
              <View key={topics[i]?.id ?? i} className="w-[38px] items-center">
                <HexCell state={s} size={30} label={t(`teacher.levelLetters.${s}`)} />
              </View>
            ))}
          </View>
        ))}
      </View>
      {rows.length > FIRST_ROWS ? (
        <SmallButton
          variant="ghost"
          label={
            all
              ? t('teacher.insights.showLess')
              : t('teacher.insights.showAll', { count: rows.length })
          }
          onPress={() => setAll((v) => !v)}
        />
      ) : null}
      <MasteryLegend />
    </View>
  );
}

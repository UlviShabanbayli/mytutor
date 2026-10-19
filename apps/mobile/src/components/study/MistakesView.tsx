import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Banner, Button, HexCell, ScreenHeader, Text } from '@/components/ui';
import { isThisWeek } from '@/features/study/time';
import type { MistakeGroup } from '@/features/study/types';
import { TestMathContext } from '@/features/tests/testMath';
import { MistakeCard } from './MistakeCard';
import { MistakeFilters, type MistakeFilter } from './MistakeFilters';

type MistakesViewProps = {
  groups: MistakeGroup[];
  subjects: { id: string; title: string }[];
  isDemo: boolean;
  onRepeat: () => void;
};

/** "Səhvlərim": missed questions by topic, filters, and one button to practise them all. */
export function MistakesView({ groups, subjects, isDemo, onRepeat }: MistakesViewProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<MistakeFilter>({ kind: 'all' });
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const shown = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        filter.kind === 'week'
          ? isThisWeek(item.finishedAt)
          : filter.kind === 'subject'
            ? item.subjectId === filter.id
            : true,
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <View className="px-4 pt-2">
        <ScreenHeader
          title={t('study.mistakes.title')}
          actions={
            <View
              accessible
              accessibilityLabel={t('study.mistakes.count', { count: total })}
              className="mr-1 h-[30px] min-w-[30px] items-center justify-center rounded-full bg-raised px-2.5"
            >
              <Text tone="honey" className="font-sans-black text-sm">
                {total}
              </Text>
            </View>
          }
        />
      </View>
      <ScrollView contentContainerClassName="gap-2 px-4 pb-4 pt-1">
        <MistakeFilters subjects={subjects} value={filter} onChange={setFilter} />
        {isDemo ? <Banner kind="info" message={t('study.mistakes.demoNote')} /> : null}
        <Text variant="caption" tone="muted" className="font-sans">
          {t('study.mistakes.intro')}
        </Text>
        {shown.length === 0 ? (
          <Text tone="muted" className="py-6 text-center">
            {t('study.mistakes.filterEmpty')}
          </Text>
        ) : null}
        {shown.map((group) => (
          <TestMathContext.Provider key={group.id} value={group.math}>
            <View accessibilityRole="header" className="mt-1.5 flex-row items-center gap-2">
              <HexCell state={group.cell} size={18} />
              <Text className="min-w-0 flex-1 font-sans-black text-sm">{group.title}</Text>
              <Text variant="caption" tone="muted">
                {t('study.mistakes.groupCount', { count: group.items.length })}
              </Text>
            </View>
            {group.items.map((item) => (
              <MistakeCard key={item.id} item={item} />
            ))}
          </TestMathContext.Provider>
        ))}
      </ScrollView>
      {/* The home indicator inset is device-specific, so it cannot be a static class. */}
      <View
        className="border-t border-border bg-page px-4 pt-2.5"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
      >
        <Button
          label={t('study.mistakes.repeatAll', { count: total })}
          icon="refresh"
          onPress={onRepeat}
        />
      </View>
    </SafeAreaView>
  );
}

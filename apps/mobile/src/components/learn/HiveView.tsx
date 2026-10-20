import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner } from '@/components/ui';
import { allTopics, findTopic, type TopicPlace } from '@/features/learn/mastery';
import { useLearnStore } from '@/features/learn/store';
import type { Hive, HiveTopic, HiveUnit } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { CellSheet } from './CellSheet';
import { FrameCard } from './FrameCard';
import { HiveHeader } from './HiveHeader';
import { HiveLegend } from './HiveLegend';
import { QueenSheet } from './QueenSheet';

type HiveViewProps = {
  hive: Hive;
  online: boolean;
  /** A unit to open on arrival (from "Növbəti çərçivə"); else the current topic's unit. */
  openUnitId?: string;
};

/**
 * The hive box: units as frames (the current one open), topics as cells. A cell opens its
 * sheet; the header downloads the box and changes the textbook.
 */
export function HiveView({ hive, online, openUnitId }: HiveViewProps) {
  const { t } = useLearnText();
  const saveTopics = useLearnStore((s) => s.saveTopics);
  const firstOpen =
    openUnitId ?? hive.units.find((u) => u.topics.some((x) => x.id === hive.currentTopicId))?.id;
  const [open, setOpen] = useState<string[]>(firstOpen ? [firstOpen] : []);
  const [cell, setCell] = useState<TopicPlace | null>(null);
  const [queen, setQueen] = useState<HiveUnit | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const ids = allTopics(hive).map((x) => x.id);
  const saved = ids.every((id) => hive.savedTopicIds.includes(id));

  const toggle = (id: string) =>
    setOpen((now) => (now.includes(id) ? now.filter((x) => x !== id) : [...now, id]));
  const pickTopic = (topic: HiveTopic) => setCell(findTopic(hive, topic.id));
  const download = () => {
    saveTopics(hive.id, ids);
    setJustSaved(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-page">
      <HiveHeader hive={hive} saved={saved} onDownload={download} />
      {online ? (
        <HiveLegend />
      ) : (
        <Banner
          kind="offline"
          message={`${t('learn.hive.offlineTitle')}. ${t('learn.hive.offlineBody')}`}
          className="mx-4 mb-2 mt-2.5"
        />
      )}
      {justSaved ? (
        <Banner kind="info" message={t('learn.hive.downloadedNote')} className="mx-4 mb-2" />
      ) : null}
      <View
        accessibilityLabel={t('learn.hive.box', { count: hive.units.length })}
        className="mx-3 mb-2.5 flex-1 overflow-hidden rounded-2xl bg-box"
      >
        <ScrollView contentContainerClassName="gap-2.5 px-2.5 py-3">
          {hive.units.map((unit, index) => (
            <FrameCard
              key={unit.id}
              hive={hive}
              unit={unit}
              open={open.includes(unit.id)}
              online={online}
              selectedId={cell?.topic.id}
              onToggle={() => toggle(unit.id)}
              onTopic={pickTopic}
              onUnitTest={() => setQueen(unit)}
            />
          ))}
        </ScrollView>
      </View>
      {cell ? (
        <CellSheet hive={hive} place={cell} online={online} onClose={() => setCell(null)} />
      ) : null}
      {queen ? <QueenSheet unit={queen} online={online} onClose={() => setQueen(null)} /> : null}
    </SafeAreaView>
  );
}

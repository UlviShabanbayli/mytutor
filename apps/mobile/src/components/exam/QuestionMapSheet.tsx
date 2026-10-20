import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, IconButton, Sheet, Text } from '@/components/ui';
import { countMap, mapStatus, type MockAnswers } from '@/features/exam/mockScoring';
import type { MockQuestion } from '@/features/exam/types';
import { MapCell } from './MapCell';
import { MapLegend } from './MapLegend';
import { TimerPill } from './TimerPill';

type QuestionMapSheetProps = {
  visible: boolean;
  questions: MockQuestion[];
  answers: MockAnswers;
  flagged: string[];
  index: number;
  remainingMs: number;
  /** The mock's whole time, for the ring around the clock. */
  totalMs: number;
  onJump: (index: number) => void;
  onClose: () => void;
  onFinish: () => void;
};

const PER_ROW = 5;

/** Every question at a glance; jump to one, or finish after a calm check of what is left. */
export function QuestionMapSheet(props: QuestionMapSheetProps) {
  const { questions, answers, flagged, index, remainingMs, totalMs, onJump, onClose, onFinish } =
    props;
  const { t } = useTranslation();
  const counts = countMap(questions, answers, flagged);
  const rows = Array.from({ length: Math.ceil(questions.length / PER_ROW) }, (_, r) =>
    questions.slice(r * PER_ROW, r * PER_ROW + PER_ROW),
  );
  const open: string[] = [];
  if (counts.empty) open.push(t('exam.map.emptyCount', { count: counts.empty }));
  if (counts.flagged) open.push(t('exam.map.flaggedCount', { count: counts.flagged }));
  const left = open.length ? `${open.join(', ')}.` : `${t('exam.map.allAnswered')}.`;

  return (
    <Sheet visible={props.visible} onClose={onClose} title={t('exam.map.title')} showTitle={false}>
      <View className="flex-row items-center gap-2">
        <Text variant="heading" className="min-w-0 flex-1">
          {t('exam.map.title')}
        </Text>
        <TimerPill remainingMs={remainingMs} totalMs={totalMs} size="sm" />
        <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={onClose} />
      </View>
      <MapLegend counts={counts} />
      <View accessibilityLabel={t('exam.map.listA11y')} className="gap-1">
        {rows.map((row, r) => (
          <View key={r} className="flex-row gap-1">
            {row.map((q, i) => {
              const n = r * PER_ROW + i;
              return (
                <MapCell
                  key={q.id}
                  number={n + 1}
                  status={mapStatus(q.id, answers, flagged)}
                  current={n === index}
                  onPress={() => onJump(n)}
                />
              );
            })}
            {Array.from({ length: PER_ROW - row.length }, (_, k) => (
              <View key={`pad${k}`} className="flex-1" />
            ))}
          </View>
        ))}
      </View>
      <View
        accessibilityRole="alert"
        className="flex-row items-start gap-2.5 rounded-lg bg-raised px-3 py-2.5"
      >
        <Icon name="info" size={20} color="honey-text" />
        <Text className="min-w-0 flex-1 text-sm">
          <Text className="font-sans-black text-sm">{t('exam.map.confirmTitle')}</Text>
          {` ${left} ${t('exam.map.lockNote')}`}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <Button
          variant="secondary"
          label={t('exam.map.back')}
          onPress={onClose}
          className="flex-1"
        />
        <Button label={t('exam.map.finish')} onPress={onFinish} className="flex-1" />
      </View>
    </Sheet>
  );
}

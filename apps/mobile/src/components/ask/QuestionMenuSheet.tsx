import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, ListRow, Sheet, Text } from '@/components/ui';
import { ReportForm } from './ReportForm';

type QuestionMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Label of the destructive row: "Sualı ləğv et" or "Söhbəti təmizlə". */
  removeLabel: string;
  /** Asked before removing; null removes at once. */
  confirm: { title: string; body: string; action: string } | null;
  onRemove: () => void;
  reported: boolean;
  onReport: () => void;
};

type Mode = 'menu' | 'confirm' | 'report';

/** "Daha çox": remove (asking first when it matters) or report; one sheet, three steps. */
export function QuestionMenuSheet({
  visible,
  onClose,
  removeLabel,
  confirm,
  onRemove,
  reported,
  onReport,
}: QuestionMenuSheetProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('menu');

  function close() {
    setMode('menu');
    onClose();
  }

  const title =
    mode === 'confirm' && confirm
      ? confirm.title
      : mode === 'report'
        ? t('ask.report.title')
        : t('ask.status.moreTitle');

  return (
    <Sheet visible={visible} onClose={close} title={title} showTitle={mode !== 'menu'}>
      {mode === 'confirm' && confirm ? (
        <>
          <Text tone="muted">{confirm.body}</Text>
          <Button label={confirm.action} variant="danger" onPress={onRemove} />
          <Button label={t('ask.status.keep')} variant="secondary" onPress={close} />
        </>
      ) : mode === 'report' ? (
        <ReportForm done={reported} onReport={onReport} onClose={close} />
      ) : (
        <View className="overflow-hidden rounded-lg border border-border">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={removeLabel}
            onPress={() => (confirm ? setMode('confirm') : onRemove())}
            className="active:bg-wax"
          >
            <ListRow icon="trash" label={removeLabel} divider />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('ask.answer.report')}
            onPress={() => setMode('report')}
            className="active:bg-wax"
          >
            <ListRow icon="report" label={t('ask.answer.report')} />
          </Pressable>
        </View>
      )}
    </Sheet>
  );
}

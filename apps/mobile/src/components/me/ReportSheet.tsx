import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Sheet, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

const REASONS = ['insult', 'cheating', 'personal', 'spam', 'other'] as const;
type Reason = (typeof REASONS)[number];

type ReportSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Sends the report; the reported item is never deleted by the student's action. */
  onReport: (reason: Reason) => void;
};

/**
 * "Şikayət et" for a message, announcement, material or class (architecture P6): pick a
 * reason, send, then a calm confirmation. Who reported is never shown to the class.
 */
export function ReportSheet({ visible, onClose, onReport }: ReportSheetProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<Reason | null>(null);
  const [done, setDone] = useState(false);
  const close = () => {
    onClose();
    setReason(null);
    setDone(false);
  };

  if (done) {
    return (
      <Sheet visible={visible} onClose={close} title={t('me.report.doneTitle')}>
        <View className="flex-row items-center gap-2.5 rounded-lg bg-ok-bg px-3 py-3">
          <Icon name="check" size={22} color="ok" />
          <Text className="flex-1 text-sm">{t('me.report.doneBody')}</Text>
        </View>
        <Button label={t('common.close')} variant="secondary" size="md" onPress={close} />
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} onClose={close} title={t('me.report.title')}>
      <View accessibilityRole="radiogroup" accessibilityLabel={t('me.report.reasonLabel')}>
        {REASONS.map((r, i) => {
          const selected = r === reason;
          return (
            <Pressable
              key={r}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setReason(r)}
              className={cn(
                'min-h-touch flex-row items-center gap-3 py-2',
                i > 0 && 'border-t border-border',
              )}
            >
              <View
                className={cn(
                  'h-6 w-6 items-center justify-center rounded-full border-2',
                  selected ? 'border-honey bg-honey' : 'border-border',
                )}
              >
                {selected ? <Icon name="check" size={14} color="on-honey" /> : null}
              </View>
              <Text className="flex-1 font-sans-semibold">{t(`me.report.reasons.${r}`)}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text variant="caption" tone="muted">
        {t('me.chat.reportNote')}
      </Text>
      <Button
        label={t('me.report.submit')}
        disabled={reason === null}
        onPress={() => {
          if (reason === null) return;
          onReport(reason);
          setDone(true);
        }}
      />
    </Sheet>
  );
}

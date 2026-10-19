import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, HexRadio, SuccessCheck, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ReportFormProps = {
  /** Already reported: only the confirmation is shown. */
  done: boolean;
  onReport: () => void;
  onClose: () => void;
};

const REASONS = ['wrong', 'unclear', 'inappropriate', 'other'] as const;

/** "Şikayət et" (P6): one reason, then the team looks at it. Used inside sheets. */
export function ReportForm({ done, onReport, onClose }: ReportFormProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);

  if (done) {
    return (
      <>
        <SuccessCheck layout="row" body={t('ask.report.done')} />
        <Button label={t('common.close')} variant="secondary" onPress={onClose} />
      </>
    );
  }

  return (
    <>
      <Text tone="muted">{t('ask.report.body')}</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('ask.report.title')}
        className="gap-1"
      >
        {REASONS.map((r) => (
          <Pressable
            key={r}
            accessibilityRole="radio"
            accessibilityState={{ checked: reason === r }}
            onPress={() => setReason(r)}
            className={cn(
              'min-h-touch flex-row items-center gap-3 rounded-md px-3',
              reason === r ? 'bg-raised' : 'active:bg-wax',
            )}
          >
            <Text className="flex-1 font-sans-bold">{t(`ask.report.reasons.${r}`)}</Text>
            <HexRadio selected={reason === r} />
          </Pressable>
        ))}
      </View>
      <Button label={t('ask.report.submit')} disabled={reason === null} onPress={onReport} />
    </>
  );
}

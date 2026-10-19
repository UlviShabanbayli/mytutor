import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, StatusPill, Text } from '@/components/ui';

export type SoonContent = { title: string; body: string };

type SoonSheetProps = {
  content: SoonContent | null;
  onClose: () => void;
  /** An action that does work today instead (e.g. "Hələlik bankdan test qur"). */
  action?: { label: string; onPress: () => void };
};

/** A calm "not ready yet" sheet for tools the design shows before they exist. */
export function SoonSheet({ content, onClose, action }: SoonSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet visible={content !== null} onClose={onClose} title={content?.title ?? ''}>
      <View className="gap-4">
        <StatusPill kind="soon" label={t('teacher.soon.badge')} />
        <Text tone="muted">{content?.body}</Text>
        {action ? (
          <Button
            label={action.label}
            onPress={() => {
              onClose();
              action.onPress();
            }}
          />
        ) : (
          <Button label={t('common.close')} variant="secondary" onPress={onClose} />
        )}
      </View>
    </Sheet>
  );
}

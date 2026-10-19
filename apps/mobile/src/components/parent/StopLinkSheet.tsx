import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, Text } from '@/components/ui';

type StopLinkSheetProps = {
  name: string | null;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Asks before the parent stops watching a child; says plainly what changes and what not. */
export function StopLinkSheet({ name, busy, onConfirm, onClose }: StopLinkSheetProps) {
  const { t } = useTranslation();
  return (
    <Sheet
      visible={name !== null}
      onClose={onClose}
      title={name ? t('parent.me.stopTitle', { name }) : ''}
    >
      <View className="gap-3">
        <Text tone="muted">{name ? t('parent.me.stopBody', { name }) : ''}</Text>
        <Button
          variant="danger"
          label={t('parent.me.stopConfirm')}
          loading={busy}
          onPress={onConfirm}
        />
        <Button variant="secondary" size="md" label={t('parent.me.cancel')} onPress={onClose} />
      </View>
    </Sheet>
  );
}

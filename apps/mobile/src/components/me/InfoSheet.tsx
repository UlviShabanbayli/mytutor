import { useTranslation } from 'react-i18next';
import { Button, Sheet, Text } from '@/components/ui';

type InfoSheetProps = {
  visible: boolean;
  title: string;
  paragraphs: string[];
  onClose: () => void;
};

/** Rules and "coming soon" explanations: a title, a few short paragraphs and "Aydındır". */
export function InfoSheet({ visible, title, paragraphs, onClose }: InfoSheetProps) {
  const { t } = useTranslation();
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      {paragraphs.map((p) => (
        <Text key={p} tone="muted">
          {p}
        </Text>
      ))}
      <Button label={t('me.shared.understood')} variant="secondary" size="md" onPress={onClose} />
    </Sheet>
  );
}

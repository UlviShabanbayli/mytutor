import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SourceRef } from '@mytutor/types';
import { Icon, Text } from '@/components/ui';

type SourceLineProps = {
  source: SourceRef;
};

/** "Source: Textbook · Riyaziyyat, 7-ci sinif, §3, p. 45" */
export function SourceLine({ source }: SourceLineProps) {
  const { t } = useTranslation();
  const parts = [
    source.title,
    source.grade ? t('common.grade', { count: source.grade, ordinal: true }) : null,
    source.section ?? null,
    source.page ? t('source.page', { page: source.page }) : null,
  ].filter(Boolean);

  return (
    <View className="flex-row items-start gap-2">
      <Icon name="book-outline" size={16} color="muted-foreground" />
      <Text variant="caption" tone="muted" className="flex-1">
        {`${t('source.label')}: ${t(`source.${source.kind}`)} · ${parts.join(', ')}`}
      </Text>
    </View>
  );
}

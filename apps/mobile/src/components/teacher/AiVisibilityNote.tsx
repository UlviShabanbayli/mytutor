import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, StatusPill, Text } from '@/components/ui';

/** "Sən təsdiqləyənə qədər şagird [AI cavabı · yoxlanır] nişanını görür." */
export function AiVisibilityNote() {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityLabel={`${t('teacher.answer.visibleBefore')} ${t('teacher.answer.aiPill')} ${t('teacher.answer.visibleAfter')}`}
      className="flex-row flex-wrap items-center gap-1.5"
    >
      <Icon name="eye" size={16} color="muted" />
      <Text variant="caption" tone="muted">
        {t('teacher.answer.visibleBefore')}
      </Text>
      <StatusPill kind="ai" label={t('teacher.answer.aiPill')} className="h-[24px] px-2" />
      <Text variant="caption" tone="muted">
        {t('teacher.answer.visibleAfter')}
      </Text>
    </View>
  );
}

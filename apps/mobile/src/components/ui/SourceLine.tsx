import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';
import { Text } from './Text';

type SourceLineProps = {
  /** Where it comes from, e.g. "Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.1 · s. 83". */
  source: string;
  className?: string;
};

/** Mandatory on every question, lesson, explanation and AI answer: book icon + "Mənbə: …". */
export function SourceLine({ source, className }: SourceLineProps) {
  const { t } = useTranslation();
  const text = t('ui.source', { source });

  return (
    <View
      accessible
      accessibilityLabel={text}
      className={cn('flex-row items-start gap-2', className)}
    >
      <Icon name="book" size={16} color="muted" />
      <Text variant="caption" tone="muted" className="flex-1 text-xs">
        {text}
      </Text>
    </View>
  );
}

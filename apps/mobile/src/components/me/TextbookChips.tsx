import { Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { TextbookProgress } from '@/features/me/types';
import { cn } from '@/lib/cn';

type TextbookChipsProps = {
  textbooks: TextbookProgress[];
  selectedId: string;
  onSelect: (id: string) => void;
};

/** One chip per hive box (textbook); the chosen one honey-ringed, unprocessed ones "Hazırlanır". */
export function TextbookChips({ textbooks, selectedId, onSelect }: TextbookChipsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={t('me.progress.textbooksLabel')}
      className="grow-0"
      contentContainerClassName="gap-2"
    >
      {textbooks.map((b) => {
        const soon = b.status === 'soon';
        const selected = b.id === selectedId;
        return (
          <Pressable
            key={b.id}
            accessibilityRole="button"
            accessibilityLabel={soon ? t('me.progress.soonLabel', { title: b.title }) : b.title}
            accessibilityState={{ selected, disabled: soon }}
            disabled={soon}
            onPress={() => onSelect(b.id)}
            className={cn(
              'h-11 flex-row items-center gap-1.5 rounded-md px-3.5',
              selected && 'border-2 border-honey bg-raised',
              !selected && !soon && 'border border-border bg-surf',
              soon && 'border border-dashed border-border',
            )}
          >
            <Text
              className={cn(
                'text-sm',
                selected ? 'font-sans-black' : 'font-sans-bold',
                soon && 'text-lock-ink',
              )}
            >
              {soon ? t('me.progress.soon', { title: b.title }) : b.title}
            </Text>
            {selected ? <Icon name="check" size={16} color="honey-text" /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

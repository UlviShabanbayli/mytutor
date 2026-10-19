import { Pressable, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import type { Textbook } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { cn } from '@/lib/cn';
import { BookArt } from './BookArt';

type TextbookOptionProps = {
  book: Textbook;
  /** The ready textbook whose topics are used meanwhile ("Hələlik TRİMS mövzuları ilə"). */
  fallback: string;
  selected: boolean;
  onPress: () => void;
};

/** One textbook as a radio card: cover, name, volumes, whether its topics are ready. */
export function TextbookOption({ book, fallback, selected, onPress }: TextbookOptionProps) {
  const { t, part } = useLearnText();
  const status = book.ready
    ? t('learn.textbook.ready', { part: part(book.readyPart ?? 1), count: book.topicCount ?? 0 })
    : t('learn.textbook.preparing', { fallback });
  const volumes =
    book.parts > 1
      ? t('learn.textbook.parts', { count: book.parts })
      : t('learn.textbook.wholeYear');

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${book.name}, ${volumes}. ${status}`}
      onPress={onPress}
      className={cn('rounded-[18px]', selected && 'bg-honey-deep pb-[3px]')}
    >
      <View
        className={cn(
          'flex-row items-center gap-3.5 rounded-[18px] border-2 p-3.5',
          selected ? 'border-honey bg-raised' : 'border-border bg-surf',
        )}
      >
        <BookArt book={book} />
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text variant="subheading">{book.name}</Text>
            <View
              className={cn(
                'h-[22px] justify-center rounded-full px-2',
                selected ? 'bg-surf' : 'bg-raised',
              )}
            >
              <Text className="font-sans-black text-xs" tone="honey">
                {volumes}
              </Text>
            </View>
          </View>
          <Text variant="caption" tone="muted" className="font-sans italic">
            {t('learn.textbook.authors')}
          </Text>
          <View className="flex-row items-start gap-1">
            <Icon
              name={book.ready ? 'check' : 'clock'}
              size={16}
              color={book.ready ? 'ok' : 'muted'}
            />
            <Text
              className={cn('flex-1 font-sans-bold text-sm', book.ready ? 'text-ok' : 'text-muted')}
            >
              {status}
            </Text>
          </View>
        </View>
        <View
          className={cn(
            'h-[26px] w-[26px] items-center justify-center rounded-full',
            selected ? 'bg-honey' : 'border-2 border-border',
          )}
        >
          {selected ? <Icon name="check" size={16} color="on-honey" /> : null}
        </View>
      </View>
    </Pressable>
  );
}

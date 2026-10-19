import { Text } from '@/components/ui';
import { highlightParts } from '@/features/learn/text';
import { cn } from '@/lib/cn';

type HighlightedProps = {
  text: string;
  query: string;
  className?: string;
};

/** Text with every match of the search query marked in nectar. */
export function Highlighted({ text, query, className }: HighlightedProps) {
  return (
    <Text className={className}>
      {highlightParts(text, query).map((part, i) =>
        part.hit ? (
          <Text key={i} className={cn(className, 'rounded bg-nectar text-on-nectar')}>
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      )}
    </Text>
  );
}

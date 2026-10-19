import { Text } from '@/components/ui';
import { splitBold } from '@/features/ask/chatScript';
import { cn } from '@/lib/cn';

type RichTextProps = {
  /** `**…**` marks bold maths. */
  text: string;
  className?: string;
};

/** One paragraph of Vızı's reply with its bold formulas. */
export function RichText({ text, className }: RichTextProps) {
  return (
    <Text className={cn('leading-[22px]', className)}>
      {splitBold(text).map((part, i) =>
        part.bold ? (
          <Text key={i} className="font-sans-black">
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      )}
    </Text>
  );
}

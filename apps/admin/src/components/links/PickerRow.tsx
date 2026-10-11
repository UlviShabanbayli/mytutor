import { cn } from '@/lib/cn';

type PickerRowProps = {
  code: string;
  text: string;
  depth: number;
  checked: boolean;
  onToggle: (code: string) => void;
};

/** One standard with its checkbox; the whole row is the label, so it is easy to hit. */
export function PickerRow({ code, text, depth, checked, onToggle }: PickerRowProps) {
  return (
    <label
      className={cn(
        'flex min-h-11 cursor-pointer items-start gap-3 px-3 py-2 transition-colors hover:bg-muted',
        depth > 0 && 'pl-8',
        checked && 'bg-secondary/60',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(code)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
      />
      <span className="shrink-0 font-mono text-xs text-primary">{code}</span>
      <span className={cn('min-w-0 text-sm text-foreground', depth === 0 && 'font-sans-bold')}>
        {text}
      </span>
    </label>
  );
}

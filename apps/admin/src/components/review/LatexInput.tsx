import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { MathText, Textarea } from '@/components/ui';

type LatexInputProps = { label: string; value: string; onChange: (value: string) => void };

/** LaTeX source with the formula drawn under it, so a typo shows at once. */
export function LatexInput({ label, value, onChange }: LatexInputProps) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-sans-bold text-foreground">
        {label} <span className="font-sans-medium text-muted-foreground">· LaTeX</span>
      </label>
      <Textarea
        id={id}
        rows={2}
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-xs"
      />
      {value.trim() ? (
        <div aria-label={t('correction.preview')} className="rounded-sm bg-muted px-2 py-1">
          <MathText latex={value} display />
        </div>
      ) : null}
    </div>
  );
}

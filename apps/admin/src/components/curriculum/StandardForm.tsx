import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { STANDARD_CODE_MAX, STANDARD_TEXT_MAX } from '@mytutor/schemas';
import type { CurriculumStandard } from '@mytutor/types';
import { Button, Input, Textarea } from '@/components/ui';

type StandardFormProps = {
  initial?: CurriculumStandard;
  /** Content lines already in the curriculum, offered as suggestions. */
  lines: string[];
  /** Codes taken by other standards. */
  takenCodes: Set<string>;
  busy: boolean;
  onSubmit: (standard: CurriculumStandard) => void;
  onCancel: () => void;
};

/** Adds or edits one standard: its code, content line and text. */
export function StandardForm({
  initial,
  lines,
  takenCodes,
  busy,
  onSubmit,
  onCancel,
}: StandardFormProps) {
  const { t } = useTranslation();
  const ids = { code: useId(), line: useId(), text: useId(), lines: useId() };
  const [code, setCode] = useState(initial?.code ?? '');
  const [line, setLine] = useState(initial?.line ?? '');
  const [text, setText] = useState(initial?.text ?? '');
  const cleanCode = code.replace(/\s+/g, '');
  const taken = takenCodes.has(cleanCode);
  const ready = cleanCode.length > 0 && text.trim().length > 0 && !taken;

  return (
    <form
      className="flex flex-col gap-3 rounded-md border border-primary/40 bg-card p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready && !busy)
          onSubmit({ code: cleanCode, text: text.trim(), line: line.trim() || null });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.code} className="font-sans-bold text-xs text-foreground">
            {t('standards.code')}
          </label>
          <Input
            id={ids.code}
            autoFocus
            value={code}
            maxLength={STANDARD_CODE_MAX}
            placeholder="1.2.3"
            aria-invalid={taken}
            aria-describedby={taken ? `${ids.code}-taken` : undefined}
            className="font-mono"
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.line} className="font-sans-bold text-xs text-foreground">
            {t('standards.line')}
          </label>
          <Input
            id={ids.line}
            list={ids.lines}
            value={line}
            maxLength={200}
            placeholder={t('standards.linePlaceholder')}
            onChange={(e) => setLine(e.target.value)}
          />
          <datalist id={ids.lines}>
            {lines.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </div>
      </div>
      {taken ? (
        <p id={`${ids.code}-taken`} className="text-xs text-destructive">
          {t('standards.codeTaken')}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">
        <label htmlFor={ids.text} className="font-sans-bold text-xs text-foreground">
          {t('standards.text')}
        </label>
        <Textarea
          id={ids.text}
          rows={3}
          value={text}
          maxLength={STANDARD_TEXT_MAX}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" className="min-h-9" onClick={onCancel} disabled={busy}>
          {t('standards.cancel')}
        </Button>
        <Button type="submit" className="min-h-9" disabled={!ready || busy}>
          {initial ? t('standards.save') : t('standards.add')}
        </Button>
      </div>
    </form>
  );
}

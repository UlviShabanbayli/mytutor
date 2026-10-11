import { Plus, X } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '@/components/ui';
import type { Draft, FieldSpec, MathPart, SubItem } from '@/features/review/correction';
import { LatexInput } from './LatexInput';

type CorrectionFieldProps = { spec: FieldSpec; draft: Draft; onChange: (value: unknown) => void };

/** One field of the correction form, by its kind. */
export function CorrectionField({ spec, draft, onChange }: CorrectionFieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const label = t(`correction.field.${spec.key}`, { defaultValue: spec.key });
  const value = draft[spec.key];
  const row = 'flex flex-col gap-2 rounded-sm border border-border p-2';
  const remove = (onRemove: () => void, name: string) => (
    <Button
      variant="ghost"
      className="size-8 min-h-8 self-end px-0"
      aria-label={t('correction.remove', { name })}
      onClick={onRemove}
    >
      <X className="size-4" />
    </Button>
  );

  if (spec.kind === 'latex')
    return <LatexInput label={label} value={value as string} onChange={onChange} />;
  if (spec.kind === 'line' || spec.kind === 'text')
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-xs font-sans-bold text-foreground">
          {label}
          {'nullable' in spec && spec.nullable ? (
            <span className="font-sans-medium text-muted-foreground">
              {' '}
              · {t('correction.optional')}
            </span>
          ) : null}
        </label>
        {spec.kind === 'line' ? (
          <Input id={id} value={value as string} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Textarea
            id={id}
            rows={3}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    );
  if (spec.kind === 'math') {
    const math = value as MathPart;
    return (
      <fieldset className={row}>
        <legend className="px-1 text-xs font-sans-bold text-foreground">{label}</legend>
        <Textarea
          aria-label={t('correction.text')}
          rows={2}
          value={math.text}
          onChange={(e) => onChange({ ...math, text: e.target.value })}
        />
        <LatexInput
          label={t('correction.formula')}
          value={math.latex}
          onChange={(latex) => onChange({ ...math, latex })}
        />
      </fieldset>
    );
  }
  if (spec.kind === 'labels') {
    const labels = value as string[];
    return (
      <fieldset className={row}>
        <legend className="px-1 text-xs font-sans-bold text-foreground">{label}</legend>
        {labels.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              aria-label={`${label} ${i + 1}`}
              value={l}
              onChange={(e) => onChange(labels.map((x, j) => (j === i ? e.target.value : x)))}
            />
            {remove(() => onChange(labels.filter((_, j) => j !== i)), `${label} ${i + 1}`)}
          </div>
        ))}
        <Button
          variant="ghost"
          className="min-h-9 self-start px-2 text-xs"
          onClick={() => onChange([...labels, ''])}
        >
          <Plus className="size-4" />
          {t('correction.addLabel')}
        </Button>
      </fieldset>
    );
  }
  const rows = value as (MathPart | SubItem)[];
  const isSub = spec.kind === 'subItems';
  const blank = isSub ? { label: '', text: '', latex: '' } : { text: '', latex: '' };
  const set = (i: number, next: MathPart | SubItem) =>
    onChange(rows.map((r, j) => (j === i ? next : r)));
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="pb-1 text-xs font-sans-bold text-foreground">{label}</legend>
      {rows.map((r, i) => {
        const name = isSub
          ? t('correction.subItem', { n: i + 1 })
          : t('correction.step', { n: i + 1 });
        return (
          <div key={i} className={row}>
            <div className="flex items-center justify-between text-xs font-sans-bold text-muted-foreground">
              {name}
              {remove(() => onChange(rows.filter((_, j) => j !== i)), name)}
            </div>
            {isSub ? (
              <Input
                aria-label={t('correction.field.label')}
                value={(r as SubItem).label}
                onChange={(e) => set(i, { ...(r as SubItem), label: e.target.value })}
              />
            ) : null}
            <Textarea
              aria-label={t('correction.text')}
              rows={2}
              value={r.text}
              onChange={(e) => set(i, { ...r, text: e.target.value })}
            />
            <LatexInput
              label={t('correction.formula')}
              value={r.latex}
              onChange={(latex) => set(i, { ...r, latex })}
            />
          </div>
        );
      })}
      <Button
        variant="ghost"
        className="min-h-9 self-start px-2 text-xs"
        onClick={() => onChange([...rows, blank])}
      >
        <Plus className="size-4" />
        {isSub ? t('correction.addSubItem') : t('correction.addStep')}
      </Button>
    </fieldset>
  );
}

import { ClipboardPaste, ListChecks, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Curriculum, CurriculumStandard } from '@mytutor/types';
import { ActionError } from '@/components/books/ActionError';
import { Button, EmptyState, Input } from '@/components/ui';
import { useSaveCurriculum } from '@/features/curriculum/mutations';
import { compareCodes, groupStandards, matchesQuery } from '@/features/curriculum/standards';
import { PasteStandardsDialog } from './PasteStandardsDialog';
import { StandardForm } from './StandardForm';
import { StandardRow } from './StandardRow';

type StandardsEditorProps = { curriculum: Curriculum };

/** The standards of a curriculum; every change is saved at once. */
export function StandardsEditor({ curriculum }: StandardsEditorProps) {
  const { t } = useTranslation();
  const save = useSaveCurriculum(curriculum.id);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [pasting, setPasting] = useState(false);
  const { standards } = curriculum;
  const codes = useMemo(() => new Set(standards.map((s) => s.code)), [standards]);
  const lines = useMemo(
    () => [...new Set(standards.flatMap((s) => (s.line ? [s.line] : [])))],
    [standards],
  );
  const groups = useMemo(
    () => groupStandards(standards.filter((s) => matchesQuery(s, query))),
    [standards, query],
  );
  const store = (next: CurriculumStandard[], onSuccess?: () => void) =>
    save.mutate(
      {
        title: curriculum.title,
        subject: curriculum.subject,
        grade: curriculum.grade,
        standards: [...next].sort((a, b) => compareCodes(a.code, b.code)),
      },
      { onSuccess },
    );
  const pasteButton = (
    <Button onClick={() => setPasting(true)}>
      <ClipboardPaste className="size-4" />
      {t('standards.paste')}
    </Button>
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {pasteButton}
        <Button variant="secondary" onClick={() => setAdding(true)} disabled={adding}>
          <Plus className="size-4" />
          {t('standards.addOne')}
        </Button>
        {standards.length ? (
          <div className="relative ml-auto w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              aria-label={t('standards.search')}
              placeholder={t('standards.search')}
              className="pl-9"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        ) : null}
      </div>
      {save.isError ? <ActionError error={save.error} /> : null}
      {adding ? (
        <StandardForm
          lines={lines}
          takenCodes={codes}
          busy={save.isPending}
          onSubmit={(standard) => store([...standards, standard], () => setAdding(false))}
          onCancel={() => setAdding(false)}
        />
      ) : null}
      {standards.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-6" />}
          title={t('standards.emptyTitle')}
          body={t('standards.emptyBody')}
        >
          {pasteButton}
        </EmptyState>
      ) : groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t('standards.noMatch')}</p>
      ) : (
        groups.map((group) => (
          <section key={group.line ?? ''} className="rounded-lg border border-border bg-card">
            <h2 className="border-b border-border px-3 py-2 font-sans-bold text-sm text-primary">
              {group.line ?? t('standards.noLine')}
              <span className="ml-2 font-sans-medium text-xs text-muted-foreground">
                {t('standards.count', { count: group.rows.length })}
              </span>
            </h2>
            <ul className="divide-y divide-border">
              {group.rows.map(({ standard, depth }) => (
                <StandardRow
                  key={standard.code}
                  standard={standard}
                  depth={depth}
                  lines={lines}
                  takenCodes={codes}
                  busy={save.isPending}
                  onSave={(next) =>
                    store(standards.map((s) => (s.code === standard.code ? next : s)))
                  }
                  onDelete={() => store(standards.filter((s) => s.code !== standard.code))}
                />
              ))}
            </ul>
          </section>
        ))
      )}
      <PasteStandardsDialog
        open={pasting}
        current={standards}
        pending={save.isPending}
        error={save.error}
        onImport={(next) => store(next, () => setPasting(false))}
        onClose={() => {
          save.reset();
          setPasting(false);
        }}
      />
    </section>
  );
}

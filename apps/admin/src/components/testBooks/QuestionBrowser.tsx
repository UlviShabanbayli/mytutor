import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestQuestionsDocument, TopicCatalogue } from '@mytutor/types';
import { Button, inputClass, SegmentedControl } from '@/components/ui';
import { questionsIn, subsectionsOf, type QuestionView } from '@/features/testBooks/filter';
import { QuestionCard } from './QuestionCard';

type QuestionBrowserProps = {
  doc: TestQuestionsDocument;
  folder: string;
  catalogue: TopicCatalogue | null;
};

/** How many cards show at first, and how many more each press adds. */
const STEP = 25;

/** The split questions by subsection, all or only those an editor should look at. */
export function QuestionBrowser({ doc, folder, catalogue }: QuestionBrowserProps) {
  const { t } = useTranslation();
  const selectId = useId();
  const [view, setView] = useState<QuestionView>('all');
  const [subsection, setSubsection] = useState('');
  const [shown, setShown] = useState(STEP);
  const all = doc.questions;
  const visible = questionsIn(all, view, subsection);
  const count = (v: QuestionView) => questionsIn(all, v, subsection).length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-[1_1_22rem] flex-col gap-1.5">
          <label htmlFor={selectId} className="text-xs font-sans-bold text-muted-foreground">
            {t('testQuestions.subsection')}
          </label>
          <select
            id={selectId}
            value={subsection}
            onChange={(e) => {
              setSubsection(e.target.value);
              setShown(STEP);
            }}
            className={inputClass()}
          >
            <option value="">{t('testQuestions.allSubsections')}</option>
            {subsectionsOf(all).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <SegmentedControl
          label={t('testQuestions.view')}
          value={view}
          onChange={(v) => {
            setView(v);
            setShown(STEP);
          }}
          options={(['all', 'flagged', 'unlinked', 'uncovered'] as const).map((v) => ({
            value: v,
            label: t(`testQuestions.views.${v}`),
            count: count(v),
          }))}
        />
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('testQuestions.none')}</p>
      ) : null}
      <div className="flex flex-col gap-3">
        {visible.slice(0, shown).map((q) => (
          <QuestionCard key={q.id} question={q} folder={folder} catalogue={catalogue} />
        ))}
      </div>
      {visible.length > shown ? (
        <Button variant="secondary" className="self-center" onClick={() => setShown(shown + STEP)}>
          {t('testQuestions.more', { count: Math.min(STEP, visible.length - shown) })}
        </Button>
      ) : null}
    </section>
  );
}

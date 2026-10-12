import type { ReactNode } from 'react';

export type GuideRow = { sample: ReactNode; text: string };

type GuideSectionProps = {
  id: string;
  title: string;
  intro?: string;
  rows: GuideRow[];
  children?: ReactNode;
};

/** One part of the guide: each row shows a mark as it looks in the panel, then what it means. */
export function GuideSection({ id, title, intro, rows, children }: GuideSectionProps) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-3">
      <h2 className="font-sans-black text-xl text-foreground">{title}</h2>
      {intro ? <p className="max-w-3xl text-sm text-muted-foreground">{intro}</p> : null}
      {rows.length ? (
        <dl className="divide-y divide-border rounded-lg border border-border bg-card">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:gap-6"
            >
              <dt className="flex shrink-0 flex-wrap items-center gap-1.5 sm:w-64">{row.sample}</dt>
              <dd className="min-w-0 text-sm text-foreground">{row.text}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children}
    </section>
  );
}

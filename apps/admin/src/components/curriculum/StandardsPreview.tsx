import type { CurriculumStandard } from '@mytutor/types';
import { groupStandards } from '@/features/curriculum/standards';
import { cn } from '@/lib/cn';

type StandardsPreviewProps = { standards: CurriculumStandard[]; emptyText: string };

/** Read-only list of standards grouped by content line, as the paste parser understood them. */
export function StandardsPreview({ standards, emptyText }: StandardsPreviewProps) {
  if (standards.length === 0)
    return (
      <p className="rounded-md border border-dashed border-border px-3 py-8 text-center text-muted-foreground">
        {emptyText}
      </p>
    );
  return (
    <div className="max-h-96 overflow-y-auto rounded-md border border-border">
      {groupStandards(standards).map((group) => (
        <section key={group.line ?? ''} className="border-b border-border last:border-b-0">
          {group.line ? (
            <h3 className="sticky top-0 bg-muted px-3 py-1.5 font-sans-bold text-xs text-foreground">
              {group.line}
            </h3>
          ) : null}
          <ul>
            {group.rows.map(({ standard, depth }) => (
              <li
                key={standard.code}
                className={cn('flex gap-2 px-3 py-1.5 text-xs', depth > 0 && 'pl-7')}
              >
                <span className="shrink-0 font-mono text-primary">{standard.code}</span>
                <span className="min-w-0 text-foreground">{standard.text}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

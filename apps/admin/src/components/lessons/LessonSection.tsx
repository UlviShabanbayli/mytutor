import type { ReactNode } from 'react';
import { Badge } from '@/components/ui';

type LessonSectionProps = {
  icon: ReactNode;
  title: string;
  count?: number;
  body?: string;
  children: ReactNode;
};

/** One part of a lesson page: its text, video, examples or exercises. */
export function LessonSection({ icon, title, count, body, children }: LessonSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className="flex items-center gap-2 font-sans-black text-xl text-foreground">
          <span className="text-primary" aria-hidden>
            {icon}
          </span>
          {title}
          {count !== undefined ? <Badge tone="primary">{count}</Badge> : null}
        </h2>
        {body ? <p className="max-w-3xl text-sm text-muted-foreground">{body}</p> : null}
      </header>
      {children}
    </section>
  );
}

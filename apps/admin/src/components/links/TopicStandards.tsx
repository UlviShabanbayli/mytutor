import { ListChecks } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { withTopicCodes } from '@/features/standards/links';
import type { BookStandards } from '@/features/standards/useBookStandards';
import { StandardLinkEditor } from './StandardLinkEditor';

type TopicStandardsProps = { bookId: string; topic: string; title: string; bs: BookStandards };

/** The topic's standard set standards under its title, editable in place. */
export function TopicStandards({ bookId, topic, title, bs }: TopicStandardsProps) {
  const { t } = useTranslation();
  if (!bs.links.standardSetId)
    return (
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <ListChecks className="size-4" aria-hidden />
        {t('links.bookNotLinked')}
        <Link
          to={`/books/${encodeURIComponent(bookId)}/standards`}
          className="text-primary underline-offset-2 hover:underline"
        >
          {t('links.chooseStandardSet')}
        </Link>
      </p>
    );
  if (!bs.standardSet) return null;
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:gap-4">
      <h2 className="flex shrink-0 items-center gap-2 self-start font-sans-bold text-sm text-foreground sm:w-48">
        <ListChecks className="size-4 text-primary" aria-hidden />
        {t('links.topicStandards')}
      </h2>
      <StandardLinkEditor
        className="flex-1"
        subject={title}
        codes={bs.links.topics[topic] ?? []}
        standards={bs.standardSet.standards}
        save={bs.save}
        apply={(codes) => withTopicCodes(bs.links, topic, codes)}
      />
    </section>
  );
}

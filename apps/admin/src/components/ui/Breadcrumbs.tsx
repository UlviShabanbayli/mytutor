import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router';

type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" /> : null}
          {item.to ? (
            <Link to={item.to} className="truncate text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="truncate font-sans-medium text-foreground" aria-current="page">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

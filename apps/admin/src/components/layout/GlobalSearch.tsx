import { Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { bookTitle } from '@/features/content/pages';
import { searchTopics, topicUrl } from '@/features/progress/search';
import { useLibrary } from '@/features/progress/useLibrary';
import { cn } from '@/lib/cn';

/** Finds a topic in any book by number or title; ⌘K / Ctrl+K jumps here. */
export function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { library } = useLibrary();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const hits = useMemo(
    () =>
      searchTopics(
        library.map((b) => ({ ...b, title: bookTitle(b.book) })),
        query,
      ),
    [library, query],
  );
  const shown = open && query.trim().length > 0;
  const go = (index: number) => {
    const hit = hits[index];
    if (!hit) return;
    void navigate(topicUrl(hit.bookId, hit.topic));
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative w-full sm:w-96">
      <label className="flex h-11 items-center gap-2.5 rounded-sm border border-border bg-card px-3.5 text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-5 shrink-0" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={shown}
          aria-controls={listId}
          aria-activedescendant={shown && hits[active] ? `${listId}-${active}` : undefined}
          aria-label={t('search.label')}
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setActive((i) => Math.min(i + 1, hits.length - 1));
            else if (e.key === 'ArrowUp') setActive((i) => Math.max(i - 1, 0));
            else if (e.key === 'Enter') go(active);
            else if (e.key === 'Escape') setOpen(false);
            else return;
            e.preventDefault();
          }}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden rounded-[6px] border border-border px-1.5 text-xs font-sans-bold sm:inline">
          ⌘K
        </kbd>
      </label>
      {shown ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('search.results')}
          className="absolute inset-x-0 top-12 z-30 max-h-96 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg"
        >
          {hits.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">{t('search.empty')}</li>
          ) : (
            hits.map((hit, i) => (
              <li
                key={`${hit.bookId}-${hit.topic.number}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // Chosen on mousedown, before the input's blur closes the list.
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(i);
                }}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2',
                  i === active ? 'bg-secondary' : 'hover:bg-muted',
                )}
              >
                <span className="min-w-10 rounded-[8px] bg-secondary px-1.5 py-1 text-center font-sans-black text-xs text-secondary-foreground">
                  {hit.topic.number}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-sans-bold text-sm text-foreground">
                    {hit.topic.title}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{hit.bookTitle}</span>
                </span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

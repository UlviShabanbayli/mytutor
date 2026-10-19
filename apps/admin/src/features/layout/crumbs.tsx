import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type Crumb = { label: string; to?: string };

type CrumbsState = { crumbs: Crumb[]; setCrumbs: (crumbs: Crumb[]) => void };

const CrumbsContext = createContext<CrumbsState | null>(null);

/** Holds the current page's breadcrumbs, which the top bar shows. */
export function CrumbsProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const value = useMemo(() => ({ crumbs, setCrumbs }), [crumbs]);
  return <CrumbsContext.Provider value={value}>{children}</CrumbsContext.Provider>;
}

/** A page names where it is; the last crumb is the page itself. */
export function usePageCrumbs(crumbs: Crumb[]) {
  const setCrumbs = useContext(CrumbsContext)?.setCrumbs;
  // Compared by content: pages build the list on every render.
  const key = JSON.stringify(crumbs);
  useEffect(() => {
    setCrumbs?.(JSON.parse(key) as Crumb[]);
  }, [key, setCrumbs]);
}

export const useCrumbs = () => useContext(CrumbsContext)?.crumbs ?? [];

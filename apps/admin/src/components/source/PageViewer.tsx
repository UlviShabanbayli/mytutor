import { useTranslation } from 'react-i18next';
import type { SourcePage } from '@mytutor/types';
import { overlayTone, type Tone } from '@/components/ui/tones';
import { cn } from '@/lib/cn';

export type Overlay = {
  key: string;
  id: string;
  bbox: { x: number; y: number; width: number; height: number };
  tone: Tone;
  dashed?: boolean;
  label?: string;
};

type PageViewerProps = {
  page: SourcePage;
  imageUrl: string;
  overlays: Overlay[];
  activeId: string | null;
  onSelect?: (id: string) => void;
};

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

/**
 * A rendered textbook page with region overlays. Regions are in PDF points (top-left origin),
 * so they are positioned as percentages of the page size and scale with the image.
 */
export function PageViewer({ page, imageUrl, overlays, activeId, onSelect }: PageViewerProps) {
  const { t } = useTranslation();
  return (
    <div className="relative w-full overflow-hidden rounded-md border border-border bg-white shadow-sm">
      <img
        src={imageUrl}
        alt={t('source.pageImage', { page: page.printedPage ?? page.page })}
        className="block h-auto w-full select-none"
        style={{ aspectRatio: `${page.width} / ${page.height}` }}
        draggable={false}
      />
      {overlays.map((o) => {
        const active = o.id === activeId;
        const style = {
          left: pct(o.bbox.x, page.width),
          top: pct(o.bbox.y, page.height),
          width: pct(o.bbox.width, page.width),
          height: pct(o.bbox.height, page.height),
        };
        const className = cn(
          'absolute rounded-sm border transition-colors',
          o.dashed ? 'border-dashed' : 'border-solid',
          overlayTone[o.tone].idle,
          active && cn('z-10 border-2 ring-2 ring-offset-0', overlayTone[o.tone].active),
        );
        return onSelect ? (
          <button
            key={o.key}
            type="button"
            title={o.label}
            aria-label={o.label}
            aria-pressed={active}
            onClick={() => onSelect(o.id)}
            className={cn(
              className,
              'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            style={style}
          />
        ) : (
          <div key={o.key} className={className} style={style} aria-hidden />
        );
      })}
    </div>
  );
}

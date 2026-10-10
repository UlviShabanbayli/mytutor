import { X } from 'lucide-react';
import { type ReactNode, type RefObject, useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/cn';

type DialogProps = {
  open: boolean;
  title: string;
  closeLabel: string;
  /** False while work is running: Esc, the backdrop and the close button do nothing. */
  dismissible?: boolean;
  onClose: () => void;
  /** Focused when the dialog opens (default: the first focusable element, the close button). */
  initialFocus?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
};

/** Native modal <dialog>: focus trap, Esc and inert background come from the browser. */
export function Dialog({
  open,
  title,
  closeLabel,
  dismissible = true,
  onClose,
  initialFocus,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // A click counts as "on the backdrop" only if the press also started there; a text selection
  // dragged out of the form ends on the backdrop but must not close the dialog.
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      initialFocus?.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, initialFocus]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      // Browsers may close a modal without a cancel event (e.g. a repeated Esc): keep the
      // element and React state in sync either way.
      onClose={() => {
        if (!open) return;
        if (dismissible) onClose();
        else ref.current?.showModal();
      }}
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        const backdrop = pressedBackdrop.current && e.target === e.currentTarget;
        pressedBackdrop.current = false;
        if (backdrop && dismissible) onClose();
      }}
      className={cn(
        'w-[min(36rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-background/75 backdrop:backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-sans-black text-xl text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={!dismissible}
            aria-label={closeLabel}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="size-5" />
          </button>
        </header>
        {open ? children : null}
      </div>
    </dialog>
  );
}

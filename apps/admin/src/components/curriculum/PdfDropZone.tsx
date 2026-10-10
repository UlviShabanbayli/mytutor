import { FileText, Upload } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

type PdfDropZoneProps = {
  file: File | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
  onReject: () => void;
};

const isPdf = (file: File) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

/** Pick or drop one PDF; the input stays a real file input for keyboard and screen readers. */
export function PdfDropZone({ file, disabled = false, onChange, onReject }: PdfDropZoneProps) {
  const { t } = useTranslation();
  const id = useId();
  const [over, setOver] = useState(false);

  // A file dropped next to the zone would otherwise make the browser open the PDF and leave
  // the panel; while the zone is shown, only the zone accepts drops.
  useEffect(() => {
    const block = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault();
    };
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);
  const accept = (picked: File | undefined) => {
    if (!picked) return;
    if (isPdf(picked)) onChange(picked);
    else onReject();
  };

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) accept(e.dataTransfer.files[0]);
      }}
      className={cn(
        'flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-5 text-center transition-colors focus-within:ring-2 focus-within:ring-ring',
        over
          ? 'border-primary bg-secondary'
          : 'border-border hover:border-primary/60 hover:bg-muted',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <input
        id={id}
        type="file"
        accept="application/pdf,.pdf"
        disabled={disabled}
        aria-describedby={`${id}-state`}
        className="sr-only"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {/* The label's own text names the input; this part says what is selected. */}
      <span className="sr-only">{t('addBook.fileLabel')}</span>
      {file ? (
        <span id={`${id}-state`} className="flex flex-col items-center gap-2">
          <FileText className="size-7 text-primary" aria-hidden />
          <span className="max-w-full break-all font-sans-bold text-sm text-foreground">
            {file.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {t('addBook.size', { size: (file.size / 1024 / 1024).toFixed(1) })} ·{' '}
            {t('addBook.change')}
          </span>
        </span>
      ) : (
        <span id={`${id}-state`} className="flex flex-col items-center gap-2">
          <Upload className="size-7 text-muted-foreground" aria-hidden />
          <span className="font-sans-bold text-sm text-foreground">{t('addBook.drop')}</span>
          <span className="text-xs text-muted-foreground">{t('addBook.dropHint')}</span>
        </span>
      )}
    </label>
  );
}

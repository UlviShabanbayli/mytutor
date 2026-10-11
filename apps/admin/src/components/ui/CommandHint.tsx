import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type CommandHintProps = { command: string };

/** A shell command the team runs locally, with a copy button. */
export function CommandHint({ command }: CommandHintProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="flex w-full max-w-2xl items-start gap-2 rounded-md border border-border bg-muted p-3 text-left">
      <code className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-xs text-foreground">
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? t('common.copied') : t('common.copy')}
        title={copied ? t('common.copied') : t('common.copy')}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

import { CircleCheck, CircleMinus, CircleX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GuideSection } from './GuideSection';
import { SampleLabel } from './samples';

const CHECKS = [
  'source_ids',
  'block_kind',
  'text_grounding',
  'latex_syntax',
  'identity',
  'image_verification',
  'figure_link',
  'grade_symbols',
] as const;

export function ChecksGuide() {
  const { t } = useTranslation();
  const result = (icon: React.ReactNode, label: string, className: string) => (
    <span className={`flex items-center gap-1.5 text-sm ${className}`}>
      {icon}
      {label}
    </span>
  );
  return (
    <GuideSection
      id="checks"
      title={t('guide.checks.title')}
      intro={t('guide.checks.intro')}
      rows={[
        {
          sample: result(
            <CircleCheck className="size-4" />,
            t('knowledge.result.pass'),
            'text-success',
          ),
          text: t('guide.checks.pass'),
        },
        {
          sample: result(
            <CircleX className="size-4" />,
            t('knowledge.result.fail'),
            'text-destructive',
          ),
          text: t('guide.checks.fail'),
        },
        {
          sample: result(
            <CircleMinus className="size-4" />,
            t('knowledge.result.skip'),
            'text-muted-foreground',
          ),
          text: t('guide.checks.skip'),
        },
        ...CHECKS.map((check) => ({
          sample: <SampleLabel>{t(`knowledge.check.${check}`)}</SampleLabel>,
          text: t(`guide.checks.${check}`),
        })),
      ]}
    />
  );
}

import { useTranslation } from 'react-i18next';
import { Sheet } from '@/components/ui';
import { ReportForm } from './ReportForm';

type ReportSheetProps = {
  visible: boolean;
  onClose: () => void;
  done: boolean;
  onReport: () => void;
};

/** The report form in a bottom sheet (answer screen). */
export function ReportSheet({ visible, onClose, done, onReport }: ReportSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet visible={visible} onClose={onClose} title={t('ask.report.title')}>
      <ReportForm done={done} onReport={onReport} onClose={onClose} />
    </Sheet>
  );
}

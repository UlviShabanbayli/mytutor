import { useTranslation } from 'react-i18next';
import { BottomInset } from '@/components/parent/BottomInset';
import { LinkCodeForm } from '@/components/parent/LinkCodeForm';
import { ParentStackHeader } from '@/components/parent/ParentStackHeader';
import { Screen } from '@/components/ui';

/** Enter the link code the child made in their own app (architecture V1). */
export default function ParentCodeScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <ParentStackHeader title={t('parent.code.title')} />
      <LinkCodeForm />
      <BottomInset />
    </Screen>
  );
}

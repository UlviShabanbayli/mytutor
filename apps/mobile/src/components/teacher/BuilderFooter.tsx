import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components/ui';
import { canSubmitTest } from '@/features/teacher/testBuilder';
import { CheckBox } from './CheckBox';
import { SurfaceTabs } from './SurfaceTabs';

export type TestAudience = 'class' | 'catalog';

type BuilderFooterProps = {
  audience: TestAudience;
  onAudience: (value: TestAudience) => void;
  rights: boolean;
  onRights: (value: boolean) => void;
  count: number;
  loading: boolean;
  onSubmit: () => void;
};

/** Who sees the test, the rights confirmation (M3) and the send button. */
export function BuilderFooter({
  audience,
  onAudience,
  rights,
  onRights,
  count,
  loading,
  onSubmit,
}: BuilderFooterProps) {
  const { t } = useTranslation();
  const catalog = audience === 'catalog';

  return (
    <>
      <SurfaceTabs
        role="radio"
        accessibilityLabel={t('teacher.builder.audience')}
        value={audience}
        onChange={onAudience}
        tabs={[
          { value: 'class', label: t('teacher.builder.audienceClass'), icon: 'users' },
          { value: 'catalog', label: t('teacher.builder.audienceCatalog'), icon: 'globe' },
        ]}
      />
      {catalog ? (
        <Text variant="caption" tone="muted" className="font-sans">
          {t('teacher.builder.catalogBefore')}
          <Text className="font-sans-black text-sm text-ink">
            {t('teacher.builder.catalogBold')}
          </Text>
          {t('teacher.builder.catalogAfter')}
        </Text>
      ) : (
        <Text variant="caption" tone="muted" className="font-sans">
          {t('teacher.builder.classNote')}
        </Text>
      )}
      {catalog ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rights }}
          onPress={() => onRights(!rights)}
          className="min-h-[44px] flex-row items-center gap-2.5"
        >
          <CheckBox checked={rights} />
          <Text className="flex-1 font-sans-semibold text-sm">{t('teacher.builder.rights')}</Text>
        </Pressable>
      ) : null}
      <Button
        label={catalog ? t('teacher.builder.submitCatalog') : t('teacher.builder.submitClass')}
        disabled={!canSubmitTest(count, audience, rights)}
        loading={loading}
        onPress={onSubmit}
      />
    </>
  );
}

import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Sheet, Text } from '@/components/ui';

type PrivacySheetProps = { visible: boolean; onClose: () => void };

/** What a teacher sees about a class member by default (architecture "Rollar və icazələr"). */
export function PrivacySheet({ visible, onClose }: PrivacySheetProps) {
  const { t } = useTranslation();
  const rows = [
    [t('teacher.me.rowName'), t('teacher.me.seeAlways'), true],
    [t('teacher.me.rowAssignments'), t('teacher.me.seeAlways'), true],
    [t('teacher.me.rowProgress'), t('teacher.me.seeIfAllowed'), false],
    [t('teacher.me.rowActivity'), t('teacher.me.seeIfAllowed'), false],
    [t('teacher.me.rowExam'), t('teacher.me.seeIfAllowed'), false],
    [t('teacher.me.rowAi'), t('teacher.me.seeOnlyMine'), false],
  ] as const;

  return (
    <Sheet visible={visible} onClose={onClose} title={t('teacher.me.privacyTitle')}>
      <View className="gap-1">
        <Text variant="caption" tone="muted">
          {t('teacher.me.privacyIntro')}
        </Text>
        {rows.map(([what, when, always]) => (
          <View
            key={what}
            accessible
            className="min-h-[44px] flex-row items-center gap-2.5 border-b border-border"
          >
            <Icon name={always ? 'eye' : 'lock'} size={18} color={always ? 'ok' : 'lock-ink'} />
            <Text className="min-w-0 flex-1 font-sans-bold text-sm">{what}</Text>
            <Text className="max-w-[45%] text-right font-sans-semibold text-xs text-muted">
              {when}
            </Text>
          </View>
        ))}
        <Text variant="caption" tone="muted" className="pt-2 font-sans">
          {t('teacher.me.privacyFooter')}
        </Text>
      </View>
    </Sheet>
  );
}

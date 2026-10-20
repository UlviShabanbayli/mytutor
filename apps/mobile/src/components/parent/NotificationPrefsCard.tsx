import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PARENT_NOTIFICATION_KINDS } from '@mytutor/schemas';
import { useNotificationPrefs } from '@/features/parent/queries';
import { joinList } from '@/features/parent/text';
import type { NotificationKind } from '@/features/parent/types';
import { useSetNotificationPref } from '@/features/parent/writes';
import { SectionLabel } from './SectionLabel';
import { ToggleRow } from './ToggleRow';

type NotificationPrefsCardProps = {
  /** Children who allow "assignment is late" notices (architecture V3: "icazə varsa"). */
  lateAllowedBy: string[];
};

/** The parent's own notification choices (P1 "Valideyn" group); each one turns off alone. */
export function NotificationPrefsCard({ lateAllowedBy }: NotificationPrefsCardProps) {
  const { t } = useTranslation();
  const prefs = useNotificationPrefs();
  const setPref = useSetNotificationPref();

  const note = (kind: NotificationKind) => {
    switch (kind) {
      case 'weeklyReport':
        return t('parent.me.notif.weeklyReportNote');
      case 'assignmentLate':
        return lateAllowedBy.length > 0
          ? t('parent.me.notif.assignmentLateNote', {
              names: joinList(
                lateAllowedBy,
                t('parent.report.clauseSeparator'),
                t('parent.report.clauseLast'),
              ),
            })
          : t('parent.me.notif.assignmentLateNobody');
      case 'longBreak':
        return t('parent.me.notif.longBreakNote');
      case 'teacherMessage':
        return t('parent.me.notif.teacherMessageNote');
    }
  };

  if (!prefs.data) return null;
  const values = prefs.data;

  return (
    <View className="gap-1.5">
      <SectionLabel>{t('parent.me.notifications')}</SectionLabel>
      <View className="overflow-hidden rounded-lg border border-border bg-surf">
        {PARENT_NOTIFICATION_KINDS.map((kind, i) => (
          <ToggleRow
            key={kind}
            title={t(`parent.me.notif.${kind}`)}
            note={note(kind)}
            on={values[kind]}
            onChange={(on) => setPref(kind, on)}
            divider={i < PARENT_NOTIFICATION_KINDS.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

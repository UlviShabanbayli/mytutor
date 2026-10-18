import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNotificationPrefs, useSetNotificationPref } from '@/features/parent/queries';
import { joinList } from '@/features/parent/text';
import { NOTIFICATION_KINDS, type NotificationKind } from '@/features/parent/types';
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
        {NOTIFICATION_KINDS.map((kind, i) => (
          <ToggleRow
            key={kind}
            title={t(`parent.me.notif.${kind}`)}
            note={note(kind)}
            on={values[kind]}
            onChange={(on) => setPref.mutate({ kind, on })}
            divider={i < NOTIFICATION_KINDS.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

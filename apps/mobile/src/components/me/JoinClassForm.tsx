import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { useMeStore } from '@/features/me/store';
import type { ClassSummary } from '@/features/me/types';
import { ConsentList } from './ConsentList';
import { Hex } from './Hex';

type JoinClassFormProps = { found: ClassSummary };

/** The class a code opens and what its teacher will see; the student sets the switches. */
export function JoinClassForm({ found }: JoinClassFormProps) {
  const { t } = useTranslation();
  const grants = useMeStore((s) => s.grants.teacher);
  const setGrant = useMeStore((s) => s.setGrant);

  return (
    <>
      <View
        accessible
        accessibilityLabel={`${t('me.join.classLabel')}: ${found.name}`}
        className="flex-row items-center gap-3 rounded-[18px] border border-border bg-surf px-3 py-2.5"
      >
        <Hex width={44} fill="honey">
          <Text className="font-display-black text-sm text-on-honey">{found.short}</Text>
        </Hex>
        <View className="flex-1 gap-0.5">
          <Text className="font-sans-black text-base">{found.name}</Text>
          <Text tone="muted" className="text-sm">
            {t('me.join.teacherMeta', {
              teacher: found.teacher,
              students: t('me.shared.studentsCount', { count: found.students }),
            })}
          </Text>
        </View>
      </View>
      <View className="mt-0.5 gap-0.5">
        <Text accessibilityRole="header" className="font-sans-black text-md">
          {t('me.join.seeTitle')}
        </Text>
        <Text tone="muted" className="text-sm">
          {t('me.join.seeBody')}
        </Text>
      </View>
      <ConsentList
        accessibilityLabel={t('me.join.consentLabel')}
        items={[
          {
            key: 'identity',
            title: t('me.consent.identity'),
            sub: t('me.consent.identityTeacher'),
          },
          { key: 'tasks', title: t('me.consent.tasks'), sub: t('me.consent.tasksTeacher') },
          {
            key: 'progress',
            title: t('me.consent.progress'),
            sub: t('me.consent.progressTeacher'),
            on: grants.progress,
            onChange: (on) => setGrant('teacher', 'progress', on),
          },
          {
            key: 'activity',
            title: t('me.consent.activity'),
            sub: t('me.consent.activitySub'),
            on: grants.activity,
            onChange: (on) => setGrant('teacher', 'activity', on),
          },
          {
            key: 'examPlan',
            title: t('me.consent.examPlan'),
            sub: t('me.consent.examPlanSub'),
            on: grants.examPlan,
            onChange: (on) => setGrant('teacher', 'examPlan', on),
          },
        ]}
      />
      <View className="flex-row items-start gap-2">
        <Icon name="shield" size={16} color="ok" />
        <Text tone="muted" className="flex-1 text-sm">
          {t('me.join.note')}
        </Text>
      </View>
    </>
  );
}

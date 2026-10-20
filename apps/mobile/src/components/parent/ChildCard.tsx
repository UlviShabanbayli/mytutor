import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Card, Icon, Text } from '@/components/ui';
import { formatClock, formatWeekRange } from '@/features/parent/format';
import type { ChildView } from '@/features/parent/types';
import { HexAvatar } from './HexAvatar';
import { LockedNote } from './LockedNote';
import { ReportButton } from './ReportButton';
import { WeekTiles } from './WeekTiles';

type ChildCardProps = { child: ChildView };

/** A linked child: who, this week in four facts, and the way into the report and assignments. */
export function ChildCard({ child }: ChildCardProps) {
  const { t } = useTranslation();
  const params = { childId: child.childId };
  const meta = [
    t('common.grade', { count: child.grade, ordinal: true }),
    child.className,
    child.teacherName,
  ]
    .filter(Boolean)
    .join(' · ');
  const sharesReport = child.grants.includes('report');
  const sharesTasks = child.grants.includes('assignments');
  const week = child.week;

  return (
    <Card className="gap-3 p-3.5">
      <View className="flex-row items-center gap-3">
        <HexAvatar name={child.name} tone="honey" />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="subheading">{child.name}</Text>
          <Text variant="caption" tone="muted" className="font-sans">
            {meta}
          </Text>
        </View>
        {child.grants.includes('progress') ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('parent.kids.openSubjects', { name: child.name })}
            onPress={() => router.push({ pathname: '/parent/subject/[childId]', params })}
            className="h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-raised active:opacity-70"
          >
            <Icon name="chevron" size={20} color="honey-text" />
          </Pressable>
        ) : null}
      </View>

      {!sharesReport ? (
        <LockedNote body={t('parent.kids.reportNotShared', { name: child.name })} />
      ) : week === null ? (
        <Text variant="caption" tone="muted" className="font-sans">
          {t('parent.kids.noActivity', { name: child.name })}
        </Text>
      ) : (
        <>
          <View className="flex-row items-baseline justify-between gap-2">
            <Text className="font-sans-black text-xs uppercase tracking-[0.9px] text-muted">
              {t('parent.kids.weekLabel', {
                range: formatWeekRange(t, new Date(week.weekStart), true),
              })}
            </Text>
            {week.lastActiveAt ? (
              <Text className="font-sans-semibold text-xs text-muted">
                {t('parent.kids.lastActive', {
                  when: formatClock(t, new Date(week.lastActiveAt), new Date()),
                })}
              </Text>
            ) : null}
          </View>
          <WeekTiles week={week} />
        </>
      )}

      {sharesReport || sharesTasks ? (
        <View className="flex-row gap-2">
          {sharesReport ? (
            <ReportButton
              isNew={week?.reportIsNew ?? false}
              onPress={() => router.push({ pathname: '/parent/report/[childId]', params })}
            />
          ) : null}
          {sharesTasks ? (
            <Button
              variant="secondary"
              size="md"
              label={t('parent.kids.assignmentsButton')}
              onPress={() => router.push({ pathname: '/parent/assignments/[childId]', params })}
              className="flex-1"
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

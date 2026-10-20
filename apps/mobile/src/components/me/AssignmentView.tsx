import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, IconButton, Screen, Text } from '@/components/ui';
import { formatWhen } from '@/features/me/format';
import { useMeStore } from '@/features/me/store';
import type { AssignmentDetail } from '@/features/me/types';
import { InfoSheet } from './InfoSheet';
import { ReportSheet } from './ReportSheet';
import { SubmissionPreview } from './SubmissionPreview';
import { TeacherFeedback } from './TeacherFeedback';
import { TopicLinkCard } from './TopicLinkCard';

type AssignmentViewProps = { item: AssignmentDetail };

/** A homework page: task, topic and file, the student's answer and the teacher's feedback. */
export function AssignmentView({ item }: AssignmentViewProps) {
  const { t } = useTranslation();
  const [sheet, setSheet] = useState<'report' | 'file' | null>(null);
  const report = useMeStore((s) => s.report);
  const done = item.status !== 'not_started';
  const attachment = item.attachment
    ? {
        name: item.attachment.name,
        size: t('me.classPage.material.file', { size: item.attachment.sizeKb }),
      }
    : null;

  return (
    <Screen className="gap-2.5">
      <View className="-mx-3 flex-row items-center gap-1">
        <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={router.back} />
        <Text tone="muted" className="flex-1 font-sans-bold text-sm">
          {item.className}
        </Text>
        <IconButton
          icon="more"
          accessibilityLabel={t('me.assignment.options')}
          onPress={() => setSheet('report')}
        />
      </View>
      <View className="gap-1.5">
        <Text variant="overline" tone="honey">
          {t('me.assignment.overline')}
        </Text>
        <Text variant="heading" className="font-display-black text-xl">
          {item.title}
        </Text>
        <View className="flex-row flex-wrap items-center gap-1.5">
          <View className="h-7 flex-row items-center gap-1 rounded-full bg-raised px-[9px]">
            <Icon name="clock" size={14} color="honey-text" />
            <Text className="font-sans-black text-xs text-honey-text">
              {formatWhen(t, item.due)}
            </Text>
          </View>
          {done ? (
            <View
              accessibilityRole="text"
              className="h-7 flex-row items-center gap-1 rounded-full bg-ok-bg px-[9px]"
            >
              <Icon name="check" size={14} color="ok" />
              <Text className="font-sans-black text-xs text-ok">
                {t('me.classPage.status.submitted')}
              </Text>
            </View>
          ) : null}
          {item.status === 'checked' ? (
            <View className="h-7 flex-row items-center gap-1 rounded-full bg-ok-bg px-[9px]">
              <Icon name="star" size={14} color="ok" />
              <Text className="font-sans-black text-xs text-ok">
                {t('me.classPage.status.checked')}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text className="leading-[22px]">{item.description}</Text>
      <TopicLinkCard topic={item.topic} />
      {attachment ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('me.assignment.download', attachment)}
          onPress={() => setSheet('file')}
          className="min-h-touch flex-row items-center gap-2.5 rounded-md border border-dashed border-border px-3 active:bg-wax"
        >
          <Icon name="file" size={20} color="info" />
          <Text className="flex-1 font-sans-bold text-sm">{attachment.name}</Text>
          <Text tone="muted" className="text-xs">
            {attachment.size}
          </Text>
          <Icon name="download" size={18} color="muted" />
        </Pressable>
      ) : null}
      <SubmissionPreview submission={item.submission} />
      {item.feedback ? <TeacherFeedback feedback={item.feedback} /> : null}
      <Button
        label={t('me.assignment.ask')}
        icon="chat"
        variant="secondary"
        size="md"
        onPress={() => router.push({ pathname: '/class/[id]/chat', params: { id: item.classId } })}
      />
      <ReportSheet
        visible={sheet === 'report'}
        onClose={() => setSheet(null)}
        onReport={() => report(item.id)}
      />
      <InfoSheet
        visible={sheet === 'file'}
        title={t('me.classPage.fileSoonTitle')}
        paragraphs={[t('me.classPage.fileSoonBody')]}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}

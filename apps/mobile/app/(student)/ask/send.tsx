import { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AnswererPicker } from '@/components/ask/AnswererPicker';
import { NoPhotoState } from '@/components/ask/NoPhotoState';
import { NoteField } from '@/components/ask/NoteField';
import { SendFooter } from '@/components/ask/SendFooter';
import { SendPhotoCard } from '@/components/ask/SendPhotoCard';
import { SubjectField } from '@/components/ask/SubjectField';
import { SubjectSheet } from '@/components/ask/SubjectSheet';
import { Icon, LoadingState, Screen, ScreenHeader, Text } from '@/components/ui';
import {
  useAskUsage,
  useClassTeacher,
  useSendQuestion,
  useStudentGrade,
} from '@/features/ask/queries';
import { photosLeft } from '@/features/ask/questions';
import { useAskStore } from '@/features/ask/store';
import { CLASS_SUBJECT_ID } from '@/features/ask/subjects';
import { useOnline } from '@/features/ask/useOnline';

/** Sualı göndər: subject, an optional note, who answers; then the question's status. */
export default function AskSendScreen() {
  const { t } = useTranslation();
  const online = useOnline();
  const draft = useAskStore((s) => s.draft);
  const { subjectId, note, queue, setSubject, setGrade, setNote, setQueue } = useAskStore();
  const grade = useStudentGrade();
  const { usage } = useAskUsage();
  const send = useSendQuestion();
  const classTeacher = useClassTeacher();
  const [picking, setPicking] = useState(false);

  if (!draft) return <NoPhotoState />;
  if (grade === undefined)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );

  const ownTeacher = subjectId === CLASS_SUBJECT_ID ? classTeacher : null;
  const subjectValue = t('ask.send.subjectValue', {
    subject: t(`ask.demo.subjects.${subjectId}`),
    grade: t('common.grade', { count: grade, ordinal: true }),
  });

  const submit = () =>
    send.mutate(
      { subjectId, grade, note, queue: ownTeacher ? queue : 'general' },
      {
        onSuccess: (question) => {
          // Back from the status goes to the Ask tab, not into the camera flow again.
          router.dismissAll();
          router.push({ pathname: '/ask/[id]', params: { id: question.id, sent: '1' } });
        },
      },
    );

  return (
    <Screen scroll={false} className="gap-0 px-0 py-0">
      <View className="px-4 pt-4">
        <ScreenHeader title={t('ask.send.title')} />
      </View>
      <ScrollView className="flex-1" contentContainerClassName="gap-3 px-4 pb-4 pt-1">
        <SendPhotoCard draft={draft} />
        <SubjectField value={subjectValue} onPress={() => setPicking(true)} />
        <NoteField value={note} onChange={setNote} />
        <AnswererPicker value={queue} onChange={setQueue} ownTeacher={ownTeacher} />
        <View className="flex-row items-center gap-2.5 rounded-md bg-info-bg px-3 py-2.5">
          <Icon name="eye" size={20} color="info" />
          <Text variant="caption" className="flex-1">
            {t('ask.send.privacy')}
          </Text>
        </View>
      </ScrollView>
      <SendFooter
        online={online}
        left={usage ? photosLeft(usage) : 1}
        used={usage?.photoUsed ?? 0}
        sending={send.isPending}
        failed={send.isError}
        onSend={submit}
      />
      <SubjectSheet
        visible={picking}
        onClose={() => setPicking(false)}
        subjectId={subjectId}
        grade={grade}
        onSubject={setSubject}
        onGrade={setGrade}
      />
    </Screen>
  );
}

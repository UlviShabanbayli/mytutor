import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Banner, ErrorState } from '@/components/ui';
import { useBank, useSaveTest, useWholeBank } from '@/features/teacher/queries';
import { countByTopic, toggleId } from '@/features/teacher/testBuilder';
import { BankLoadingRow } from './BankLoadingRow';
import { BankQuestionRow } from './BankQuestionRow';
import { BuilderFooter, type TestAudience } from './BuilderFooter';
import { BuilderTopicTiles } from './BuilderTopicTiles';
import { NoteLine } from './NoteLine';
import { Overline } from './Overline';
import { SmallButton } from './SmallButton';
import { SoonSheet } from './SoonSheet';
import { TeacherScreen } from './TeacherScreen';

type TestBuilderProps = {
  /** Gets the live selection count so the header can say "4 sual seçildi". */
  header: (selectedCount: number) => ReactNode;
  topicIds: string[];
  initial: { title: string | null; topicId: string; questionIds: string[] };
};

/** Build a test from our bank (M3): pick questions per topic, choose class or catalog. */
export function TestBuilder({ header, topicIds, initial }: TestBuilderProps) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState(initial.topicId);
  const [selected, setSelected] = useState(initial.questionIds);
  const [audience, setAudience] = useState<TestAudience>('catalog');
  const [rights, setRights] = useState(true);
  const [own, setOwn] = useState(false);
  const bank = useBank(topic);
  const whole = useWholeBank();
  const save = useSaveTest();
  const counts = countByTopic(selected, whole.data ?? []);

  const submit = () => {
    const topics = topicIds.filter((id) => (counts[id] ?? 0) > 0).join(', ');
    save.mutate(
      {
        title: initial.title ?? t('teacher.builder.autoTitle', { topics }),
        questionIds: selected,
        audience,
      },
      { onSuccess: () => (router.canGoBack() ? router.back() : router.replace('/teacher/create')) },
    );
  };

  return (
    <TeacherScreen
      header={header(selected.length)}
      contentClassName="gap-2.5"
      footerStyle="sheet"
      footer={
        <BuilderFooter
          audience={audience}
          onAudience={setAudience}
          rights={rights}
          onRights={setRights}
          count={selected.length}
          loading={save.isPending}
          onSubmit={submit}
        />
      }
    >
      <View className="flex-row items-center gap-2">
        <Overline className="flex-1">{t('teacher.builder.fromBank')}</Overline>
        <SmallButton
          variant="dashed"
          icon="plus"
          label={t('teacher.builder.own')}
          onPress={() => setOwn(true)}
        />
      </View>
      <BuilderTopicTiles topicIds={topicIds} counts={counts} value={topic} onChange={setTopic} />
      <NoteLine icon="lock">{t('teacher.builder.locked')}</NoteLine>
      {bank.isPending ? (
        <BankLoadingRow label={t('teacher.builder.loading')} />
      ) : bank.isError ? (
        <ErrorState onRetry={() => void bank.refetch()} />
      ) : bank.data.length === 0 ? (
        <Banner kind="info" message={t('teacher.builder.emptyTopic')} />
      ) : (
        bank.data.map((q) => (
          <BankQuestionRow
            key={q.id}
            question={q}
            selected={selected.includes(q.id)}
            onToggle={() => setSelected((ids) => toggleId(ids, q.id))}
          />
        ))
      )}
      {save.isError ? <Banner kind="error" message={t('common.errorDescription')} /> : null}
      <SoonSheet
        content={
          own
            ? { title: t('teacher.soon.questionTitle'), body: t('teacher.soon.questionBody') }
            : null
        }
        onClose={() => setOwn(false)}
      />
    </TeacherScreen>
  );
}

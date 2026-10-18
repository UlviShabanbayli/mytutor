import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SourceLine, Text } from '@/components/ui';
import type { StudyLesson } from '@/features/study/types';
import { AskViziChip } from './AskViziChip';
import { Kicker } from './Kicker';
import { NoteBox } from './NoteBox';
import { PageDots } from './PageDots';
import { RuleBox } from './RuleBox';
import { StepLayout } from './StepLayout';

type LessonTextStepProps = {
  lesson: StudyLesson;
  onNext: () => void;
};

/** Step 2: the lesson text page by page, with the rule box and the common-mistake note. */
export function LessonTextStep({ lesson, onNext }: LessonTextStepProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const page = lesson.pages[index];
  const total = lesson.pages.length;
  if (!page) return null;

  return (
    <StepLayout
      footer={
        <>
          {total > 1 ? <PageDots index={index} total={total} /> : null}
          <Button
            label={t('study.common.continue')}
            onPress={() => (index < total - 1 ? setIndex(index + 1) : onNext())}
          />
        </>
      }
    >
      <Kicker>{t('study.lesson.textKicker', { n: 2 })}</Kicker>
      <Text variant="heading" className="font-display-black text-2xl">
        {page.heading}
      </Text>
      {page.paragraphs.map((p) => (
        <Text key={p} className="font-sans-medium">
          {p}
        </Text>
      ))}
      {page.rule ? <RuleBox lines={page.rule} /> : null}
      {page.after ? <Text className="font-sans-medium">{page.after}</Text> : null}
      {page.note ? <NoteBox text={page.note} /> : null}
      {page.askVizi ? <AskViziChip label={page.askVizi} /> : null}
      <SourceLine source={lesson.source} />
    </StepLayout>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SourceLine, Text } from '@/components/ui';
import type { LessonView } from '@/features/study/types';
import { AskViziChip } from './AskViziChip';
import { BookAnswersCard } from './BookAnswersCard';
import { Kicker } from './Kicker';
import { NoteBox } from './NoteBox';
import { PageDots } from './PageDots';
import { RuleBox } from './RuleBox';
import { StepLayout } from './StepLayout';

type LessonTextStepProps = {
  lesson: LessonView;
  /** The step's number in the lesson, for "Addım 2 · Qayda". */
  n: number;
  onNext: () => void;
};

/**
 * The lesson text page by page (the book's approved text, or the demo lesson's), with the rule
 * box and the common-mistake note; the book's answers follow the last page when there are any.
 */
export function LessonTextStep({ lesson, n, onNext }: LessonTextStepProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const page = lesson.pages[index];
  const total = lesson.pages.length;
  if (!page) return null;
  const last = index === total - 1;

  return (
    <StepLayout
      footer={
        <>
          {total > 1 ? <PageDots index={index} total={total} /> : null}
          <Button
            label={t('study.common.continue')}
            onPress={() => (last ? onNext() : setIndex(index + 1))}
          />
        </>
      }
    >
      <Kicker>{t('study.lesson.textKicker', { n })}</Kicker>
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
      <SourceLine source={lesson.textSource} />
      {last && lesson.bookAnswers ? <BookAnswersCard answers={lesson.bookAnswers} /> : null}
    </StepLayout>
  );
}

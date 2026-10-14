import { BookOpenCheck, PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TopicSource } from '@mytutor/types';
import { CommandHint } from '@/components/ui';
import type { LessonMaterial } from '@/features/lessons/material';
import { commands } from '@/lib/commands';
import { LessonEntryCard } from './LessonEntryCard';
import { LessonSection } from './LessonSection';

type LessonBookMaterialProps = {
  material: LessonMaterial;
  source: TopicSource;
  topicDir: string;
  /** The book's id, and whether its answer key has been read. */
  bookId: string;
  hasAnswerKey: boolean;
};

/** The book's worked examples and exercises of a lesson, each with its pages. */
export function LessonBookMaterial(props: LessonBookMaterialProps) {
  const { material, source, topicDir, bookId, hasAnswerKey } = props;
  const { t } = useTranslation();
  const answered = material.exercises.filter((e) => e.answers.length).length;
  const parts = [
    {
      key: 'examples',
      icon: <BookOpenCheck className="size-5" />,
      entries: material.examples,
      title: t('lessons.examples'),
      body: t('lessons.examplesBody'),
      none: t('lessons.noExamples'),
      hint: null,
    },
    {
      key: 'exercises',
      icon: <PenLine className="size-5" />,
      entries: material.exercises,
      title: t('lessons.exercises'),
      body: hasAnswerKey
        ? t('lessons.exercisesAnswered', { answered, total: material.exercises.length })
        : t('lessons.exercisesNoKey'),
      hint: hasAnswerKey ? null : commands.answers(bookId),
      none: t('lessons.noExercises'),
    },
  ];
  return parts.map((part) => (
    <LessonSection
      key={part.key}
      icon={part.icon}
      title={part.title}
      count={part.entries.length}
      body={part.body}
    >
      {part.hint ? <CommandHint command={part.hint} /> : null}
      {part.entries.length ? (
        part.entries.map((e) => (
          <LessonEntryCard key={e.item.id} entry={e} source={source} topicDir={topicDir} />
        ))
      ) : (
        <p className="text-sm text-muted-foreground">{part.none}</p>
      )}
    </LessonSection>
  ));
}

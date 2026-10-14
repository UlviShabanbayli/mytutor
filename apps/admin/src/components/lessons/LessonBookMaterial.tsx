import { BookOpenCheck, PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TopicSource } from '@mytutor/types';
import type { LessonMaterial } from '@/features/lessons/material';
import { LessonEntryCard } from './LessonEntryCard';
import { LessonSection } from './LessonSection';

type LessonBookMaterialProps = { material: LessonMaterial; source: TopicSource; topicDir: string };

/** The book's worked examples and exercises of a lesson, each with its pages. */
export function LessonBookMaterial({ material, source, topicDir }: LessonBookMaterialProps) {
  const { t } = useTranslation();
  const parts = [
    {
      key: 'examples',
      icon: <BookOpenCheck className="size-5" />,
      entries: material.examples,
      title: t('lessons.examples'),
      body: t('lessons.examplesBody'),
      none: t('lessons.noExamples'),
    },
    {
      key: 'exercises',
      icon: <PenLine className="size-5" />,
      entries: material.exercises,
      title: t('lessons.exercises'),
      body: t('lessons.exercisesBody'),
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

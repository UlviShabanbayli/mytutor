import { allTopics } from './mastery';
import { matches } from './text';
import type { Hive, HiveTopic, PlacementQuestion, TeacherMaterial } from './types';

/*
 * Search over what the phone already has (demo until the search API exists): the hive's
 * topics, their board lessons and teacher materials, and the questions of the checks.
 */

export type LessonHit =
  | { kind: 'board'; id: string; topic: HiveTopic; minutes: number }
  | { kind: 'teacher'; id: string; topic: HiveTopic; material: TeacherMaterial };

export type QuestionHit = { id: string; topic: HiveTopic; text: string };

export type SearchIndex = {
  topics: HiveTopic[];
  lessons: LessonHit[];
  questions: QuestionHit[];
};

export type SearchResults = SearchIndex & { total: number };

export const MIN_QUERY = 2;

export function buildSearchIndex(hive: Hive, questions: PlacementQuestion[]): SearchIndex {
  const topics = allTopics(hive);
  const lessons = topics.flatMap((topic): LessonHit[] => {
    const minutes = topic.steps.find((s) => s.kind === 'lesson')?.minutes ?? 0;
    const board: LessonHit = { kind: 'board', id: `lesson-${topic.id}`, topic, minutes };
    return topic.material
      ? [board, { kind: 'teacher', id: topic.material.id, topic, material: topic.material }]
      : [board];
  });
  return {
    topics,
    lessons,
    questions: questions.flatMap((q) => {
      const topic = topics.find((t) => t.id === q.topicId);
      return topic ? [{ id: q.id, topic, text: q.prompt }] : [];
    }),
  };
}

export function searchLearn(index: SearchIndex, query: string): SearchResults {
  if (query.trim().length < MIN_QUERY) return { topics: [], lessons: [], questions: [], total: 0 };
  const topics = index.topics.filter((t) => matches(t.title, query) || t.number === query.trim());
  const lessons = index.lessons.filter((l) =>
    matches(l.kind === 'teacher' ? l.material.title : l.topic.title, query),
  );
  const questions = index.questions.filter((q) => matches(q.text, query));
  return { topics, lessons, questions, total: topics.length + lessons.length + questions.length };
}

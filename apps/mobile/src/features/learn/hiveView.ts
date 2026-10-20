import type { CurriculumResponse, Hive as WorldHive } from '@mytutor/types';
import type { Hive, SubjectEntry } from './types';

/** The demo world's hive box as the learn screens draw it. */
export function hiveView(hive: WorldHive): Hive {
  return {
    id: hive.id,
    subjectId: hive.subjectId,
    subjectName: hive.subjectName,
    grade: hive.grade,
    textbookId: hive.textbookId,
    part: hive.part,
    textbooks: hive.textbooks,
    units: hive.units.map((unit) => ({
      id: unit.id,
      number: unit.number,
      title: unit.title,
      unitTest: unit.unitTest,
      topics: unit.topics.map((topic) => ({
        id: topic.id,
        number: topic.number,
        title: topic.title,
        page: topic.pages.start,
        level: topic.level,
        prerequisites: topic.prerequisites,
        steps: topic.steps,
        ...(topic.material ? { material: topic.material } : {}),
      })),
    })),
    currentTopicId: hive.currentTopicId,
    savedTopicIds: hive.savedTopicIds,
    started: hive.filled > 0 || hive.currentTopicId !== null,
  };
}

/** A curriculum subject as a tile: a hive box when one of its textbooks is ready. */
export function subjectEntry(
  curriculum: CurriculumResponse,
  subjectId: string,
): SubjectEntry | null {
  const subject = curriculum.subjects.find((s) => s.id === subjectId);
  if (!subject) return null;
  const ready = curriculum.textbooks.some(
    (b) => b.subjectId === subject.id && b.volumes.some((v) => v.ready),
  );
  return {
    id: subject.id,
    name: subject.name,
    monogram: subject.monogram,
    grade: subject.grade,
    ...(ready ? { hiveId: subject.id } : {}),
  };
}

/** A grade's subjects: the one with a ready textbook (its hive) and the ones being prepared. */
export function gradeSubjects(
  curriculum: CurriculumResponse,
  grade: number,
): { hiveId: string | null; preparing: SubjectEntry[] } {
  const entries = curriculum.subjects
    .filter((s) => s.grade === grade)
    .flatMap((s) => subjectEntry(curriculum, s.id) ?? []);
  return {
    hiveId: entries.find((e) => e.hiveId)?.hiveId ?? null,
    preparing: entries.filter((e) => !e.hiveId),
  };
}

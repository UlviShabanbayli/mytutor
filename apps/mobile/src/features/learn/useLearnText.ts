import { useTranslation } from 'react-i18next';
import type { Hive, HiveTopic, MasteryLevel } from './types';

/** Shared wording of the learn screens: names, sources and levels. */
export function useLearnText() {
  const { t } = useTranslation();
  const grade = (count: number) => t('common.grade', { count, ordinal: true });
  const part = (count: number) => t('learn.part', { count, ordinal: true });
  const bookName = (hive: Hive) =>
    hive.textbooks.find((b) => b.id === hive.textbookId)?.name ?? hive.textbookId;
  const hiveName = (hive: Hive) =>
    t('learn.hiveName', { subject: hive.subjectName, grade: hive.grade });
  const book = (hive: Hive) =>
    t('learn.source.book', { name: hiveName(hive), book: bookName(hive), part: part(hive.part) });

  return {
    t,
    grade,
    part,
    bookName,
    hiveName,
    /** "Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.3 · s. 90" (without "Mənbə:"). */
    source: (hive: Hive, topic: HiveTopic, withPage = true) => {
      const text = t('learn.source.topic', { book: book(hive), number: topic.number });
      return withPage && topic.page ? t('learn.source.page', { text, page: topic.page }) : text;
    },
    levelName: (level: MasteryLevel) => t(`learn.level.${level}.name`),
    levelShort: (level: MasteryLevel) => t(`learn.level.${level}.short`),
    levelCaps: (level: MasteryLevel) => t(`learn.level.${level}.caps`),
    levelPill: (level: MasteryLevel) =>
      t('learn.levelPill', {
        name: t(`learn.level.${level}.name`),
        long: t(`learn.level.${level}.long`),
      }),
    levelAria: (level: MasteryLevel) =>
      t('learn.levelAria', {
        name: t(`learn.level.${level}.name`),
        long: t(`learn.level.${level}.long`),
      }),
  };
}

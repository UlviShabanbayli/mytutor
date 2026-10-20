import type { TFunction } from 'i18next';
import type { StudyTest } from './types';

/** The pill under the session header: "Mövzu testi · 4.3", "Bölmə sınağı · 4", "Səhvlərim". */
export function testKindLabel(t: TFunction, study: StudyTest): string {
  const title = study.topicCode ?? study.test.title;
  if (study.kind === 'mistakes') return t('study.test.kindMistakes');
  if (study.kind === 'unit') return t('study.test.kindUnit', { title });
  if (study.kind === 'review') return t('study.test.kindReview', { title });
  if (study.kind === 'demo') return t('study.test.kindDemo', { title });
  return t('study.test.kindTopic', { title });
}

/** The CAPS line at the top of the result: "MÖVZU TESTİ · 4.3". */
export function resultKicker(t: TFunction, study: StudyTest): string {
  if (study.kind === 'mistakes') return t('study.result.kickerMistakes');
  if (study.kind === 'unit')
    return t('study.result.kickerUnit', { code: study.topicCode ?? study.test.title });
  if (study.kind === 'review')
    return t('study.result.kickerReview', { code: study.topicCode ?? '' });
  if (study.kind === 'demo') return t('study.result.kickerDemo', { code: study.topicCode ?? '' });
  return study.topicCode
    ? t('study.result.kickerTopicCode', { code: study.topicCode })
    : t('study.result.kickerTopic');
}

import type { TFunction } from 'i18next';
import { ANSWER_MINUTES } from './demo';
import type { AskQuestion } from './types';

/** One line under a question in the lists: who is on it, or what happened. */
export function questionNote(t: TFunction, q: AskQuestion): string {
  switch (q.status) {
    case 'queued':
      return t('ask.state.noteQueued');
    case 'sent':
      return t('ask.state.noteSent');
    case 'teacher_checking':
      return q.queue === 'teacher' && q.teacherName
        ? t('ask.state.noteChecking', { teacher: q.teacherName, minutes: ANSWER_MINUTES.teacher })
        : t('ask.state.noteCheckingGeneral', { minutes: ANSWER_MINUTES.general });
    case 'answered':
      if (q.answer?.correctedAi) return t('ask.state.noteCorrected');
      if (q.queue === 'general') return t('ask.state.noteGeneral');
      return t('ask.state.noteApproved', { teacher: q.teacherName ?? q.answer?.teacherName ?? '' });
  }
}

/** The status chip's words, for screen readers. */
export function statusLabel(t: TFunction, q: Pick<AskQuestion, 'status'>): string {
  switch (q.status) {
    case 'queued':
      return t('ask.state.chipQueued');
    case 'sent':
      return t('ask.state.chipSent');
    case 'teacher_checking':
      return t('ask.state.chipAi');
    case 'answered':
      return t('ask.state.chipReady');
  }
}

/** "Lalə Həsənova" → "LH" (avatar until teachers have photos). */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase('az'))
    .join('');
}

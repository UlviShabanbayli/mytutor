import { router } from 'expo-router';
import { useLearnStore, usePlacementSession } from './store';
import { placementOutcome, placementStep } from './placement';
import type { Hive, HiveTopic, PlacementQuestion, StepKind } from './types';

/*
 * Where the learn screens lead. Lessons belong to the study area: a topic's lesson is opened by
 * the topic id with the step to start at (demo ids, until lessons come from the API).
 */

export function openTopic(topicId: string) {
  router.push({ pathname: '/topic/[id]', params: { id: topicId } });
}

export function openKnowSkip(topicId: string) {
  router.push({ pathname: '/topic/[id]/know', params: { id: topicId } });
}

export function openTest(testId: string) {
  router.push({ pathname: '/test/[id]', params: { id: testId } });
}

/** Opens a step of the topic: the lesson at that step, or the topic test when there is one. */
export function openStep(topic: HiveTopic, kind: StepKind, testId: string | null) {
  if (kind === 'test') {
    if (testId) openTest(testId);
    return;
  }
  router.push({ pathname: '/lesson/[id]', params: { id: topic.id, step: kind } });
}

/** Back where the screen came from, or to a fallback when it was opened by a link. */
export function backOr(fallback: () => void) {
  if (router.canGoBack()) router.back();
  else fallback();
}

/**
 * Opens a hive box. The first time, the student first says which textbook their school uses
 * and then picks "Bilirəm, yoxla" or "Sıfırdan başla" (architecture Ş3); afterwards straight in.
 */
export function openHive(hiveId: string) {
  const { textbooks, placement } = useLearnStore.getState();
  if (!textbooks[hiveId])
    router.push({ pathname: '/learn/textbook', params: { hiveId, first: '1' } });
  else if (!placement[hiveId])
    router.push({ pathname: '/placement/[subjectId]', params: { subjectId: hiveId } });
  else router.push({ pathname: '/subject/[id]', params: { id: hiveId } });
}

/** After the textbook choice: on a first open on to "Haradan başlayaq?", else back. */
export function afterTextbookPick(hiveId: string, firstOpen: boolean) {
  const { placement } = useLearnStore.getState();
  if (firstOpen && !placement[hiveId])
    router.replace({ pathname: '/placement/[subjectId]', params: { subjectId: hiveId } });
  else if (firstOpen) router.replace({ pathname: '/subject/[id]', params: { id: hiveId } });
  else backOr(() => router.replace({ pathname: '/subject/[id]', params: { id: hiveId } }));
}

/** "Yoxlamaya başla": a fresh check session, then its first question. */
export function startPlacement(hiveId: string) {
  usePlacementSession.getState().begin(hiveId);
  router.push({ pathname: '/placement/[subjectId]/question', params: { subjectId: hiveId } });
}

/** "Sıfırdan başla": no check (it stays available), straight into the hive. */
export function skipPlacement(hiveId: string) {
  useLearnStore.getState().skipPlacement(hiveId);
  router.replace({ pathname: '/subject/[id]', params: { id: hiveId } });
}

/** Records an answer; the last one stores the outcome and shows the result. */
export function answerPlacement(
  hive: Hive,
  questions: PlacementQuestion[],
  question: PlacementQuestion,
  choice: number | null,
) {
  const session = usePlacementSession.getState();
  const finished = !placementStep(hive, questions, session.answers).next;
  if (session.hiveId !== hive.id || finished) session.begin(hive.id);
  usePlacementSession.getState().answer(question.id, choice);
  const answers = usePlacementSession.getState().answers;
  if (placementStep(hive, questions, answers).next) return;
  useLearnStore.getState().finishPlacement(hive.id, placementOutcome(hive, questions, answers));
  router.replace({ pathname: '/placement/[subjectId]/result', params: { subjectId: hive.id } });
}

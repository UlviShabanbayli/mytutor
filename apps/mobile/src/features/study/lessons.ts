import type { LessonStepName } from './types';

/** The learn area's topic steps open the lesson at their part: "examples" → the worked example. */
const BY_TOPIC_STEP: Record<string, LessonStepName> = {
  lesson: 'video',
  examples: 'example',
  practice: 'exercise',
};

/**
 * The `step` search parameter as an index into the lesson's steps: "1"–"4", a topic step name
 * ("examples") or a lesson step name ("text"). Anything else, or a step the lesson does not
 * have, is the first step.
 */
export function stepIndexOf(param: string | undefined, steps: LessonStepName[]): number {
  if (param === undefined) return 0;
  const n = Number(param);
  if (Number.isInteger(n) && n >= 1 && n <= steps.length) return n - 1;
  const name = BY_TOPIC_STEP[param] ?? param;
  return Math.max(0, steps.indexOf(name as LessonStepName));
}

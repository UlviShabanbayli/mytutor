import { answerDemo } from '@mytutor/demo-data';
import { hiveSchema, placementQuestionSchema } from '@mytutor/schemas';
import type { DemoPersona } from '@mytutor/types';
import { hiveView } from '../hiveView';

/** The demo world's answers the learn tests read, at a pinned "now". */

const NOW = new Date('2026-10-20T06:00:00.000Z');

export const worldHive = (persona: DemoPersona = 'nermin') =>
  hiveView(hiveSchema.parse(answerDemo('/v1/hive', { persona, now: NOW }).body));

export const worldPlacement = () =>
  placementQuestionSchema
    .array()
    .parse(answerDemo('/v1/hive/placement', { persona: 'nermin', now: NOW }).body);

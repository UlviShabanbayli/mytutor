import { curriculumResponseSchema, hiveSchema, placementQuestionSchema } from '@mytutor/schemas';
import type { CurriculumResponse, DemoPersona, PlacementQuestion } from '@mytutor/types';
import { orNull } from '@/features/tests/api';
import { apiGet } from '@/lib/api';
import { hiveView } from './hiveView';
import type { Hive } from './types';

/** The learn area's reads from the demo world. */

export const fetchCurriculum = (persona: DemoPersona): Promise<CurriculumResponse> =>
  apiGet('/v1/curriculum', { persona, parse: curriculumResponseSchema.parse });

/** A subject's hive box (`/v1/hive` is the student's own subject); null while it is prepared. */
export async function fetchHive(persona: DemoPersona, subjectId?: string): Promise<Hive | null> {
  const path = subjectId ? `/v1/hive/${encodeURIComponent(subjectId)}` : '/v1/hive';
  const hive = await orNull(apiGet(path, { persona, parse: hiveSchema.parse }));
  return hive ? hiveView(hive) : null;
}

/** "Bilirəm, yoxla": the demo's short placement questions. */
export const fetchPlacement = (persona: DemoPersona): Promise<PlacementQuestion[]> =>
  apiGet('/v1/hive/placement', { persona, parse: placementQuestionSchema.array().parse });

import { type QueryClient, queryOptions, useQueryClient } from '@tanstack/react-query';
import type { DemoPersona } from '@mytutor/types';
import { useDemoPersona } from '@/lib/demoPersona';
import * as api from './api';
import { assignmentOf, classDetailOf, contentsOf } from './views';

/**
 * Query keys and shared queries of the teacher area. Every key starts with the persona, so
 * switching it never shows the other world's answers; `['teacher']` covers them all.
 */

export const TEACHER_KEY = ['teacher'] as const;

export const teacherKey = (persona: DemoPersona, ...parts: string[]) =>
  [...TEACHER_KEY, persona, ...parts] as const;

/** The ready volumes' units and topics; the table of contents does not change. */
export const contentsQuery = (persona: DemoPersona) =>
  queryOptions({
    queryKey: teacherKey(persona, 'contents'),
    queryFn: async () => contentsOf(await api.getCurriculum(persona)),
    staleTime: Infinity,
  });

/** GET /v1/teacher: the teacher, her profile, classes and notifications. */
export const homeQuery = (persona: DemoPersona) =>
  queryOptions({ queryKey: teacherKey(persona, 'home'), queryFn: () => api.getHome(persona) });

/** All of the teacher's assignments with their topics. */
export const assignmentsQuery = (persona: DemoPersona, client: QueryClient) =>
  queryOptions({
    queryKey: teacherKey(persona, 'assignments'),
    queryFn: async () => {
      const [list, contents] = await Promise.all([
        api.getAssignments(persona),
        client.ensureQueryData(contentsQuery(persona)),
      ]);
      return list.map((a) => assignmentOf(contents, a));
    },
  });

/** GET /v1/teacher/classes/:id: the class, its roster and its assignments. */
export const classQuery = (persona: DemoPersona, client: QueryClient, id: string) =>
  queryOptions({
    queryKey: teacherKey(persona, 'classes', id),
    queryFn: async () => {
      const [detail, contents] = await Promise.all([
        api.getClass(persona, id),
        client.ensureQueryData(contentsQuery(persona)),
      ]);
      return classDetailOf(contents, detail);
    },
    enabled: id !== '',
  });

/** The persona and the query client, for hooks that build queries from the ones above. */
export function useTeacherScope() {
  return { persona: useDemoPersona(), client: useQueryClient() };
}

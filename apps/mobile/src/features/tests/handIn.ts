import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { meResponseSchema, studentAssignmentSchema } from '@mytutor/schemas';
import type { DemoPersona, StudentAssignment } from '@mytutor/types';
import { apiGet } from '@/lib/api';
import { useDemoWrite } from '@/lib/demoEvents';
import { useDemoPersona } from '@/lib/demoPersona';

/** Query keys of what handing in a test needs to know: the student and their assignments. */
const handInKeys = {
  me: (persona: DemoPersona) => ['tests', 'me', persona] as const,
  assignments: (persona: DemoPersona) => ['tests', 'assignments', persona] as const,
};

/**
 * The assignment ("4.2 testi") a finished test answers and that is not handed in yet, if the
 * student has one. Past its due date it is still handed in (late).
 */
export function openAssignmentFor(
  assignments: StudentAssignment[],
  testId: string,
): StudentAssignment | null {
  return (
    assignments.find(
      (a) => a.testId === testId && (a.submission === null || a.submission.submittedAt === null),
    ) ?? null
  );
}

async function handIn(
  client: QueryClient,
  persona: DemoPersona,
  testId: string,
): Promise<{ assignmentId: string; studentId: string } | null> {
  const [me, assignments] = await Promise.all([
    client.fetchQuery({
      queryKey: handInKeys.me(persona),
      queryFn: () => apiGet('/v1/me', { persona, parse: meResponseSchema.parse }),
    }),
    client.fetchQuery({
      queryKey: handInKeys.assignments(persona),
      queryFn: () =>
        apiGet('/v1/assignments', { persona, parse: studentAssignmentSchema.array().parse }),
    }),
  ]);
  const assignment = openAssignmentFor(assignments, testId);
  return assignment ? { assignmentId: assignment.id, studentId: me.profile.personId } : null;
}

/**
 * Hands in the class assignment a finished test belongs to (`assignment.submitted`), so the
 * teacher's list, the parent's and Today see it. A test nobody assigned writes nothing.
 */
export function useHandInTest(): (testId: string) => void {
  const client = useQueryClient();
  const persona = useDemoPersona();
  const write = useDemoWrite();
  return (testId) => {
    void handIn(client, persona, testId)
      .then((found) => {
        if (found) write({ type: 'assignment.submitted', ...found });
      })
      // Without the API and the world nothing can be handed in; the result stays on the device.
      .catch(() => undefined);
  };
}

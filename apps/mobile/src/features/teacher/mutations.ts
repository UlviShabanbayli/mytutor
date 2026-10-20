import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AssignmentKind, Audience, DemoEventInput, SolutionStep } from '@mytutor/types';
import { ApiError } from '@/lib/api';
import { useDemoWrite } from '@/lib/demoEvents';
import { classShortName, makeInviteCode } from './classroom';
import { assignmentsQuery, contentsQuery, homeQuery, useTeacherScope } from './teacherQuery';
import type { InboxQuestion, TeacherClass, TopicView } from './types';
import { topicOf, unitOfTopic } from './views';
import { answerNote, newAssignment } from './writes';

/**
 * The teacher's writes. Each one that students and parents should see is a shared demo event
 * (`useDemoWrite`), applied to the world on this device for every role.
 */

/** A write as a mutation, so screens keep `isPending`, `onSuccess` and offline pausing. */
function useEventMutation<TVars>(
  toEvent: (vars: TVars) => Promise<DemoEventInput>,
  mutationKey?: readonly string[],
) {
  const write = useDemoWrite();
  return useMutation({
    mutationKey,
    mutationFn: async (vars: TVars) => write(await toEvent(vars)),
  });
}

/** The teacher's person id ("lale"), from the cached GET /v1/teacher. */
function useTeacherId() {
  const { persona, client } = useTeacherScope();
  return async () => (await client.ensureQueryData(homeQuery(persona))).profile.personId;
}

export type NewAssignmentInput = {
  classId: string;
  kind: AssignmentKind;
  topicId: string;
  audience: Audience;
  dueAt: string;
};

/** `assignment.created`: the class's students see it in their class, Today and the parent's list. */
export function useCreateAssignment() {
  const { t } = useTranslation();
  const { persona, client } = useTeacherScope();
  return useEventMutation(async (input: NewAssignmentInput) => {
    const [contents, list] = await Promise.all([
      client.ensureQueryData(contentsQuery(persona)),
      client.fetchQuery(assignmentsQuery(persona, client)),
    ]);
    const topic = topicOf(contents, input.topicId);
    const unit = unitOfTopic(contents, input.topicId);
    if (!topic || !unit) throw new ApiError(404, `topic ${input.topicId} not found`);
    const words = {
      number: topic.number,
      title: topic.title,
      count: Number(unit.number),
      ordinal: true,
    };
    const assignment = newAssignment(
      {
        ...input,
        topic,
        unit,
        title: t(`teacher.assign.titles.${input.kind}`, words),
        description: t(`teacher.assign.descriptions.${input.kind}`, words),
      },
      list.map((a) => a.id),
      new Date(),
    );
    return { type: 'assignment.created', assignment };
  });
}

/** Paused while offline (TanStack's online manager) and sent by itself once back online. */
export const SAVE_GRADE_KEY = ['teacher', 'saveGrade'] as const;

export type GradeInput = {
  assignmentId: string;
  studentId: string;
  score: number;
  outOf: number;
  comment: string;
};

/** `assignment.graded`: the student, the parent and Today show the grade. */
export const useSaveGrade = () =>
  useEventMutation(
    async (v: GradeInput) => ({
      type: 'assignment.graded',
      assignmentId: v.assignmentId,
      studentId: v.studentId,
      score: v.score,
      outOf: v.outOf,
      comment: v.comment.trim() || undefined,
    }),
    SAVE_GRADE_KEY,
  );

export type ApproveInput = {
  question: InboxQuestion;
  steps: SolutionStep[];
  /** The topic the teacher linked instead of the question's own; null when unchanged. */
  topic: TopicView | null;
};

/**
 * `ask.answered`: the student's question shows "Müəllim təsdiqlədi". The event carries no
 * steps or topic, so the teacher's changes go to the student in its note.
 */
export function useApproveAnswer() {
  const { t } = useTranslation();
  const teacherId = useTeacherId();
  return useEventMutation(async (v: ApproveInput) => {
    const steps = answerNote(v.question.aiDraft?.steps ?? [], v.steps, (index, s) =>
      t('teacher.answer.noteLine', { index, text: s.text, formula: s.formula }),
    );
    const topic = v.topic
      ? t('teacher.answer.noteTopic', {
          topic: t('teacher.topicLine', { id: v.topic.number, title: v.topic.title }),
        })
      : undefined;
    const note = [steps, topic].filter(Boolean).join('\n');
    return {
      type: 'ask.answered',
      questionId: v.question.id,
      teacherId: await teacherId(),
      note: note || undefined,
    };
  });
}

/** `member.removed`: the student leaves the class's roster, chat and assignments. */
export const useRemoveMember = () =>
  useEventMutation(async (v: { classId: string; studentId: string }) => ({
    type: 'member.removed',
    classId: v.classId,
    studentId: v.studentId,
  }));

/** `message.sent`: the class chat or the parent sees it on their side. */
export function useSendMessage() {
  const teacherId = useTeacherId();
  return useEventMutation(async (v: { threadId: string; text: string }) => ({
    type: 'message.sent',
    threadId: v.threadId,
    fromPersonId: await teacherId(),
    text: v.text.trim(),
  }));
}

/** `notification.read` for each notification the bell's list showed. */
export function useReadNotices() {
  const write = useDemoWrite();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      for (const notificationId of ids) write({ type: 'notification.read', notificationId });
    },
  });
}

/*
 * Writes the shared demo events have no type for yet (a new class, an SMS invite, a test saved
 * for the class or the catalogue). They answer on this screen and are not kept; proposals for
 * the events: `class.created`, `material.saved`.
 */

export type NewClassInput = { subject: string; grade: number; name: string };

/** The new class with its invite code, shown on the screen that opened it (not kept). */
export const useCreateClass = () =>
  useMutation({
    mutationFn: async (input: NewClassInput): Promise<TeacherClass> => {
      const shortName = classShortName(input.name);
      return {
        id: `new-${shortName.toLowerCase()}`,
        shortName,
        name: input.name.trim(),
        subjectId: '',
        subject: input.subject,
        grade: input.grade,
        teacherId: '',
        joinCode: makeInviteCode(shortName, 'MATH'),
        paid: false,
        groups: [],
        chatOpen: true,
        studentCount: 0,
        activeThisWeek: 0,
        activeAssignments: 0,
        completion: 0,
        chatUnread: 0,
        book: `${input.subject} ${input.grade}`,
      };
    },
  });

/** The SMS invite is sent by the API (Twilio Verify stays server-side); the demo only accepts. */
export const useInviteByPhone = () =>
  useMutation({ mutationFn: async (_v: { classId: string; phone: string }) => ({ sent: true }) });

/** A test from the bank, for the class or the catalogue (not kept in the demo yet). */
export const useSaveTest = () =>
  useMutation({
    mutationFn: async (v: {
      title: string;
      questionIds: string[];
      audience: 'class' | 'catalog';
    }) => v,
  });

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type {
  AssignmentKind,
  Audience,
  ClassGroup,
  DemoEventInput,
  SolutionStep,
} from '@mytutor/types';
import { ApiError } from '@/lib/api';
import { useDemoWrite } from '@/lib/demoEvents';
import { classShortName, makeInviteCode } from './classroom';
import { assignmentsQuery, contentsQuery, homeQuery, useTeacherScope } from './teacherQuery';
import type { InboxQuestion, TeacherClass, TopicView } from './types';
import { topicOf, unitOfTopic } from './views';
import { editedSteps, newAssignment } from './writes';

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
 * `ask.answered`: the student's question shows "Müəllim təsdiqlədi", with the teacher's own
 * steps when she changed the AI's and the topic she linked.
 */
export function useApproveAnswer() {
  const teacherId = useTeacherId();
  return useEventMutation(async (v: ApproveInput) => ({
    type: 'ask.answered',
    questionId: v.question.id,
    teacherId: await teacherId(),
    steps: editedSteps(v.question.aiDraft?.steps ?? [], v.steps),
    topicId: v.topic?.id,
  }));
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
  return useEventMutation(async (v: { threadId: string; text: string; replyToId?: string }) => ({
    type: 'message.sent',
    threadId: v.threadId,
    fromPersonId: await teacherId(),
    text: v.text.trim(),
    replyToId: v.replyToId,
  }));
}

/** `thread.read`: the teacher has seen the conversation; the parent or student sees "Oxundu". */
export function useReadThread() {
  const teacherId = useTeacherId();
  return useEventMutation(async (threadId: string) => ({
    type: 'thread.read',
    threadId,
    readerId: await teacherId(),
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

export type NewClassInput = {
  subjectKey: string;
  subject: string;
  grade: number;
  name: string;
  paid: boolean;
};

/** The id slug of a subject key, for the class's subject id ("riyaziyyat-7"). */
const SUBJECT_SLUGS: Record<string, string> = {
  math: 'riyaziyyat',
  azLang: 'azerbaycan-dili',
  english: 'ingilis-dili',
  physics: 'fizika',
  biology: 'biologiya',
  history: 'tarix',
  chemistry: 'kimya',
  geography: 'cografiya',
};

/** `class.created`: the class, its code and its chat; students can join with the code. */
export function useCreateClass() {
  const { persona, client } = useTeacherScope();
  const teacherId = useTeacherId();
  const write = useDemoWrite();
  return useMutation({
    mutationFn: async (input: NewClassInput): Promise<TeacherClass> => {
      const home = await client.ensureQueryData(homeQuery(persona));
      const shortName = classShortName(input.name);
      const taken = new Set(home.classes.map((c) => c.id));
      const base = shortName.toLowerCase() || 'sinif';
      let id = base;
      for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
      const cls = {
        id,
        shortName,
        name: input.name.trim(),
        subjectId: `${SUBJECT_SLUGS[input.subjectKey] ?? input.subjectKey}-${input.grade}`,
        subject: input.subject,
        grade: input.grade,
        teacherId: await teacherId(),
        joinCode: makeInviteCode(shortName, 'MATH'),
        paid: input.paid,
        groups: [],
        chatOpen: true,
      };
      write({ type: 'class.created', class: cls });
      return {
        ...cls,
        studentCount: 0,
        activeThisWeek: 0,
        activeAssignments: 0,
        completion: 0,
        chatUnread: 0,
        book: `${input.subject} ${input.grade}`,
      };
    },
  });
}

/** `announcement.posted`: the class's students see it in their class feed. */
export function usePostAnnouncement() {
  const teacherId = useTeacherId();
  return useEventMutation(async (v: { classId: string; text: string }) => ({
    type: 'announcement.posted',
    classId: v.classId,
    authorId: await teacherId(),
    text: v.text.trim(),
  }));
}

/** `class.chatSet`: students can (or cannot) write in the class chat. */
export const useSetClassChat = () =>
  useEventMutation(async (v: { classId: string; open: boolean }) => ({
    type: 'class.chatSet',
    classId: v.classId,
    open: v.open,
  }));

/** `group.saved`: a group of the class, created or changed (saved whole). */
export const useSaveGroup = () =>
  useEventMutation(async (v: { classId: string; group: ClassGroup }) => ({
    type: 'group.saved',
    classId: v.classId,
    group: v.group,
  }));

/** `member.muted`: the student can (or cannot) write in the class chat. */
export const useMuteMember = () =>
  useEventMutation(async (v: { classId: string; studentId: string; muted: boolean }) => ({
    type: 'member.muted',
    classId: v.classId,
    studentId: v.studentId,
    muted: v.muted,
  }));

/** The SMS invite is sent by the API (Twilio Verify stays server-side); the demo only accepts. */
export const useInviteByPhone = () =>
  useMutation({ mutationFn: async (_v: { classId: string; phone: string }) => ({ sent: true }) });

export type SaveTestInput = {
  /** The draft being edited, or none for a new test. */
  draftId?: string;
  title: string;
  topicId: string;
  questionIds: string[];
  audience: 'class' | 'catalog';
};

/**
 * `material.saved`: a test from the bank, sent to the teacher's classes (they see it in their
 * class) or to the catalogue's review.
 */
export function useSaveTest() {
  const { persona, client } = useTeacherScope();
  const teacherId = useTeacherId();
  return useEventMutation(async (v: SaveTestInput) => {
    const home = await client.ensureQueryData(homeQuery(persona));
    const toClass = v.audience === 'class';
    return {
      type: 'material.saved',
      material: {
        id: v.draftId ?? `mat-test-${Date.now().toString(36)}`,
        ownerId: await teacherId(),
        kind: 'test',
        title: v.title,
        topicId: v.topicId || null,
        classIds: toClass ? home.classes.map((c) => c.id) : [],
        size: v.questionIds.length,
        state: toClass ? 'class' : 'in_review',
        updatedAt: new Date().toISOString(),
      },
    };
  });
}

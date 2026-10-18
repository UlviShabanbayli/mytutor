import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { SolutionStep } from './types';

export const teacherKeys = {
  all: ['teacher'] as const,
  profile: ['teacher', 'profile'] as const,
  topics: ['teacher', 'topics'] as const,
  unit: ['teacher', 'unit'] as const,
  today: ['teacher', 'today'] as const,
  classes: ['teacher', 'classes'] as const,
  class: (id: string) => ['teacher', 'classes', id] as const,
  members: (id: string) => ['teacher', 'classes', id, 'members'] as const,
  assignments: (id: string) => ['teacher', 'classes', id, 'assignments'] as const,
  announcements: (id: string) => ['teacher', 'classes', id, 'announcements'] as const,
  assignment: (id: string) => ['teacher', 'assignments', id] as const,
  submissions: (id: string) => ['teacher', 'assignments', id, 'submissions'] as const,
  inbox: ['teacher', 'inbox'] as const,
  question: (id: string) => ['teacher', 'inbox', id] as const,
  materials: ['teacher', 'materials'] as const,
  bank: (topicId: string) => ['teacher', 'bank', topicId] as const,
  wholeBank: ['teacher', 'bank'] as const,
  insights: (classId: string) => ['teacher', 'insights', classId] as const,
  live: ['teacher', 'live'] as const,
  liveRoom: (id: string) => ['teacher', 'live', id] as const,
  conversations: ['teacher', 'conversations'] as const,
  notices: ['teacher', 'notices'] as const,
};

export const useTeacherProfile = () =>
  useQuery({ queryKey: teacherKeys.profile, queryFn: api.fetchProfile });

export const useTopics = () => useQuery({ queryKey: teacherKeys.topics, queryFn: api.fetchTopics });

export const useUnit = () => useQuery({ queryKey: teacherKeys.unit, queryFn: api.fetchUnit });

export const useTeacherToday = () =>
  useQuery({ queryKey: teacherKeys.today, queryFn: api.fetchToday });

/** One platform topic by id ("4.1"), from the cached contents list. */
export function useTopic(id: string | undefined) {
  const { data } = useTopics();
  return data?.find((t) => t.id === id);
}

export const useTeacherClasses = () =>
  useQuery({ queryKey: teacherKeys.classes, queryFn: api.fetchClasses });

export const useTeacherClass = (id: string) =>
  useQuery({
    queryKey: teacherKeys.class(id),
    queryFn: () => api.fetchClass(id),
    enabled: id !== '',
  });

export const useClassMembers = (id: string) =>
  useQuery({ queryKey: teacherKeys.members(id), queryFn: () => api.fetchMembers(id) });

export const useClassAssignments = (id: string) =>
  useQuery({ queryKey: teacherKeys.assignments(id), queryFn: () => api.fetchAssignments(id) });

export const useAnnouncements = (id: string) =>
  useQuery({ queryKey: teacherKeys.announcements(id), queryFn: () => api.fetchAnnouncements(id) });

export const useAssignment = (id: string) =>
  useQuery({ queryKey: teacherKeys.assignment(id), queryFn: () => api.fetchAssignment(id) });

export const useSubmissions = (assignmentId: string) =>
  useQuery({
    queryKey: teacherKeys.submissions(assignmentId),
    queryFn: () => api.fetchSubmissions(assignmentId),
  });

export const useTeacherInbox = () =>
  useQuery({ queryKey: teacherKeys.inbox, queryFn: api.fetchInbox });

export const useInboxQuestion = (id: string) =>
  useQuery({ queryKey: teacherKeys.question(id), queryFn: () => api.fetchQuestion(id) });

export const useMaterials = () =>
  useQuery({ queryKey: teacherKeys.materials, queryFn: api.fetchMaterials });

export const useBank = (topicId: string) =>
  useQuery({ queryKey: teacherKeys.bank(topicId), queryFn: () => api.fetchBank(topicId) });

export const useTestDraft = (draftId: string | undefined) =>
  useQuery({
    queryKey: ['teacher', 'testDraft', draftId ?? 'new'],
    queryFn: () => api.fetchTestDraft(draftId),
  });

export const useWholeBank = () =>
  useQuery({ queryKey: teacherKeys.wholeBank, queryFn: api.fetchWholeBank });

export const useClassInsights = (classId: string) =>
  useQuery({ queryKey: teacherKeys.insights(classId), queryFn: () => api.fetchInsights(classId) });

export const useLiveRooms = () =>
  useQuery({ queryKey: teacherKeys.live, queryFn: api.fetchLiveRooms });

export const useLiveRoom = (id: string) =>
  useQuery({ queryKey: teacherKeys.liveRoom(id), queryFn: () => api.fetchLiveRoom(id) });

export const useConversations = () =>
  useQuery({ queryKey: teacherKeys.conversations, queryFn: api.fetchConversations });

export const useNotices = () =>
  useQuery({ queryKey: teacherKeys.notices, queryFn: api.fetchNotices });

/** Counts on the teacher menu: questions waiting for an answer, conversations with news. */
export function useTeacherBadges() {
  const inbox = useTeacherInbox();
  const conversations = useConversations();
  return {
    inbox: inbox.data?.filter((q) => !q.approved).length ?? 0,
    messages: conversations.data?.filter((c) => c.unread > 0).length ?? 0,
  };
}

/** A demo write: runs the api function, then refreshes everything the teacher area shows. */
function useTeacherMutation<TVars, TResult>(
  fn: (vars: TVars) => Promise<TResult>,
  mutationKey?: readonly string[],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey,
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

export const useCreateClass = () => useTeacherMutation(api.createClass);

export const useSetClassChat = () =>
  useTeacherMutation((v: { classId: string; open: boolean }) =>
    api.setClassChat(v.classId, v.open),
  );

export const usePostAnnouncement = () =>
  useTeacherMutation((v: { classId: string; text: string }) =>
    api.postAnnouncement(v.classId, v.text),
  );

export const useInviteByPhone = () =>
  useTeacherMutation((v: { classId: string; phone: string }) =>
    api.inviteByPhone(v.classId, v.phone),
  );

export const useAddGroup = () =>
  useTeacherMutation((v: { classId: string; name: string }) => api.addGroup(v.classId, v.name));

export const useToggleGroupMember = () =>
  useTeacherMutation((v: { classId: string; groupId: string; memberId: string }) =>
    api.toggleGroupMember(v.classId, v.groupId, v.memberId),
  );

export const useSetMemberMuted = () =>
  useTeacherMutation((v: { classId: string; memberId: string; muted: boolean }) =>
    api.setMemberMuted(v.classId, v.memberId, v.muted),
  );

export const useRemoveMember = () =>
  useTeacherMutation((v: { classId: string; memberId: string }) =>
    api.removeMember(v.classId, v.memberId),
  );

export const useCreateAssignment = () => useTeacherMutation(api.createAssignment);

/** Paused while offline (TanStack's online manager) and sent by itself once back online. */
export const SAVE_GRADE_KEY = ['teacher', 'saveGrade'] as const;

export const useSaveGrade = () =>
  useTeacherMutation(
    (v: { submissionId: string; grade: number; comment: string }) =>
      api.saveGrade(v.submissionId, v.grade, v.comment),
    SAVE_GRADE_KEY,
  );

export const useApproveAnswer = () =>
  useTeacherMutation((v: { id: string; steps: SolutionStep[]; topicId: string }) =>
    api.approveAnswer(v.id, v.steps, v.topicId),
  );

export const useSaveTest = () => useTeacherMutation(api.saveTest);

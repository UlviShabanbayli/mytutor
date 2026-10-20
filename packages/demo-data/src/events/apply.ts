import type { DemoEvent, DemoWorld, StudyGoal } from '@mytutor/types';
import { makeClock } from '../clock';
import { withExamGoal } from '../exam/goal';
import {
  childLinked,
  childUnlinked,
  classJoined,
  classLeft,
  consentDecided,
  notificationRead,
} from './people';
import { askAnswered, askCancelled, askSent } from './ask';
import {
  announcementPosted,
  classChatSet,
  classCreated,
  groupSaved,
  materialSaved,
  memberMuted,
} from './classes';
import { testFinished } from './progress';
import { messageSent, threadRead } from './talk';
import { assignmentCreated, assignmentGraded, assignmentSubmitted } from './work';

/**
 * The world with the device's demo events applied, oldest first. Pure: the given world is
 * never changed, and the same world and events always give the same result. Events that point
 * at nothing (an unknown thread, class or question) change nothing.
 */
export function applyDemoEvents(world: DemoWorld, events: readonly DemoEvent[]): DemoWorld {
  if (events.length === 0) return world;
  // Private copies to change: the world and the events are plain JSON, and an event's payload
  // (a question, an assignment) becomes part of the world.
  const w = JSON.parse(JSON.stringify(world)) as DemoWorld;
  const log = JSON.parse(JSON.stringify(events)) as DemoEvent[];
  let goal: StudyGoal | null = null;
  for (const e of log.sort((a, b) => a.at.localeCompare(b.at))) {
    switch (e.type) {
      case 'assignment.created':
        assignmentCreated(w, e);
        break;
      case 'assignment.submitted':
        assignmentSubmitted(w, e);
        break;
      case 'assignment.graded':
        assignmentGraded(w, e);
        break;
      case 'message.sent':
        messageSent(w, e);
        break;
      case 'thread.read':
        threadRead(w, e);
        break;
      case 'ask.sent':
        askSent(w, e);
        break;
      case 'ask.answered':
        askAnswered(w, e);
        break;
      case 'ask.cancelled':
        askCancelled(w, e);
        break;
      case 'class.joined':
        classJoined(w, e);
        break;
      case 'class.left':
      case 'member.removed':
        classLeft(w, e);
        break;
      case 'class.created':
        classCreated(w, e);
        break;
      case 'announcement.posted':
        announcementPosted(w, e);
        break;
      case 'group.saved':
        groupSaved(w, e);
        break;
      case 'member.muted':
        memberMuted(w, e);
        break;
      case 'class.chatSet':
        classChatSet(w, e);
        break;
      case 'material.saved':
        materialSaved(w, e);
        break;
      case 'child.linked':
        childLinked(w, e);
        break;
      case 'child.unlinked':
        childUnlinked(w, e);
        break;
      case 'consent.decided':
        consentDecided(w, e);
        break;
      case 'notification.read':
        notificationRead(w, e);
        break;
      case 'test.finished':
        testFinished(w, e);
        break;
      case 'exam.goalSet':
        goal = e.goal;
        w.student.goal = e.goal;
        break;
    }
  }
  recount(w);
  return goal ? withExamGoal(w, goal) : w;
}

/** Numbers that follow from the changed world: today's photo questions, homework to grade. */
function recount(w: DemoWorld) {
  const clock = makeClock(new Date(w.now));
  const sentToday = w.askQuestions.filter(
    (q) =>
      q.studentId === w.student.personId &&
      q.timeline.some((t) => t.event === 'sent' && clock.daysUntil(t.at) === 0),
  ).length;
  w.askUsage.photoUsed = Math.min(sentToday, w.askUsage.photoLimit);
  const toGrade = (assignmentId: string) =>
    w.submissions.filter((s) => s.assignmentId === assignmentId && s.state === 'submitted').length;
  w.notifications = w.notifications.filter(
    (n) => n.kind !== 'homework' || toGrade(n.assignmentId) > 0,
  );
  for (const n of w.notifications) if (n.kind === 'homework') n.count = toGrade(n.assignmentId);
}

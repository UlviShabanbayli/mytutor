import { answerDemo } from '@mytutor/demo-data';
import {
  announcementSchema,
  chatThreadDetailSchema,
  chatThreadViewSchema,
  childAssignmentListSchema,
  meResponseSchema,
  notificationSchema,
  parentCodeLookupSchema,
  parentHomeSchema,
} from '@mytutor/schemas';
import type { DemoEvent, DemoEventInput } from '@mytutor/types';
import { toAssignmentItem, toChildViews, toConversations, toThread } from './map';

/** The parent's writes as demo events, read back the way the parent's (and others') screens do. */

const NOW = new Date('2026-10-20T06:00:00.000Z');
let n = 0;
const ev = (input: DemoEventInput): DemoEvent => {
  n += 1;
  return {
    ...input,
    id: `ev-${n}`,
    at: new Date(NOW.getTime() - (30 - n) * 60_000).toISOString(),
  } as DemoEvent;
};
const get = <T>(path: string, events: DemoEvent[], parse: (v: unknown) => T): T => {
  const answer = answerDemo(path, { persona: 'nermin', now: NOW, events });
  if (answer.status !== 200) throw new Error(`${answer.status} ${path}`);
  return parse(answer.body);
};

const home = (events: DemoEvent[]) => get('/v1/parent', events, parentHomeSchema.parse);
const code = (events: DemoEvent[]) =>
  get('/v1/parent/codes/K7Q42M', events, parentCodeLookupSchema.parse);
const unlink = ev({ type: 'child.unlinked', parentId: 'sebine', childId: 'nermin' });
const link = ev({ type: 'child.linked', parentId: 'sebine', childId: 'nermin' });

describe('linking with K7Q42M', () => {
  it('says Səbinə already follows Nərmin, until she stops the link', () => {
    expect(code([]).alreadyLinked).toBe(true);
    expect(code([unlink]).alreadyLinked).toBe(false);
    expect(home([unlink]).children.map((c) => c.childId)).toEqual(['elvin']);
  });

  it("shows Nərmin on the parent's home and Səbinə in Nərmin's Mən → Valideyn again", () => {
    const kids = toChildViews(home([unlink, link]), []);
    expect(kids.find((c) => c.childId === 'nermin')).toMatchObject({
      status: 'active',
      grants: ['report', 'progress', 'assignments'],
    });
    const me = get('/v1/me', [unlink, link], meResponseSchema.parse);
    expect(me.parents.find((p) => p.parentId === 'sebine')?.status).toBe('active');
  });
});

describe('consent for Elvin', () => {
  it('opens his account when approved and drops the request when declined', () => {
    const approve = ev({
      type: 'consent.decided',
      parentId: 'sebine',
      childId: 'elvin',
      approved: true,
    });
    const decline = ev({
      type: 'consent.decided',
      parentId: 'sebine',
      childId: 'elvin',
      approved: false,
    });
    expect(home([approve]).children.find((c) => c.childId === 'elvin')?.status).toBe('active');
    expect(home([decline]).children.map((c) => c.childId)).toEqual(['nermin']);
    expect(home([approve]).consentRequests).toEqual([]);
  });
});

describe('the parent–teacher chat', () => {
  const thread = (events: DemoEvent[], role: 'parent' | 'teacher') =>
    get(`/v1/${role}/messages/dm-lale-sebine`, events, chatThreadDetailSchema.parse);
  const notes = get('/v1/parent/notes', [], announcementSchema.array().parse);

  it("puts Səbinə's message on both sides", () => {
    const sent = ev({
      type: 'message.sent',
      threadId: 'dm-lale-sebine',
      fromPersonId: 'sebine',
      text: 'Salam!',
    });
    const mine = toThread(thread([sent], 'parent'), home([sent]), notes);
    expect(mine?.messages.at(-1)).toMatchObject({ from: 'me', text: 'Salam!' });
    expect(thread([sent], 'teacher').messages.at(-1)).toMatchObject({
      text: 'Salam!',
      mine: false,
    });
  });

  it("brings Lalə's reply as unread with a notification", () => {
    const reply = ev({
      type: 'message.sent',
      threadId: 'dm-lale-sebine',
      fromPersonId: 'lale',
      text: 'Sabah görüşərik.',
    });
    const threads = get('/v1/parent/messages', [reply], chatThreadViewSchema.array().parse);
    const [lale] = toConversations(threads, home([reply]), notes);
    expect(lale?.last).toMatchObject({ text: 'Sabah görüşərik.', fromMe: false });
    expect(lale?.unread).toBeGreaterThan(0);
    const list = get('/v1/parent/notifications', [reply], notificationSchema.array().parse);
    expect(list.some((x) => x.kind === 'teacherMessage' && !x.read && x.at === reply.at)).toBe(
      true,
    );
  });
});

describe('what other roles write, seen by Səbinə', () => {
  it("shows Lalə's grade for hw-4-1 in Nərmin's assignments", () => {
    const graded = ev({
      type: 'assignment.graded',
      assignmentId: 'hw-4-1',
      studentId: 'nermin',
      score: 9,
      outOf: 10,
    });
    const list = get(
      '/v1/parent/children/nermin/assignments',
      [graded],
      childAssignmentListSchema.parse,
    );
    const hw = list.items.find((a) => a.id === 'hw-4-1');
    expect(hw && toAssignmentItem(hw)).toMatchObject({
      state: 'checked',
      score: { kind: 'points', value: 9, max: 10 },
    });
  });

  it('takes "Yeni" off the report once its notification is read', () => {
    const read = ev({ type: 'notification.read', notificationId: 'n-pa-report' });
    const notifications = get('/v1/parent/notifications', [read], notificationSchema.array().parse);
    expect(toChildViews(home([read]), notifications)[0]?.week?.reportIsNew).toBe(false);
  });
});

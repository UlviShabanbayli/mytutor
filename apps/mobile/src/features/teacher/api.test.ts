import {
  approveAnswer,
  createClass,
  fetchAssignment,
  fetchClasses,
  fetchInbox,
  fetchInsights,
  fetchMembers,
  removeMember,
  resetTeacherDemo,
  saveGrade,
} from './api';

beforeEach(() => resetTeacherDemo(new Date(2026, 9, 18, 14, 0)));

describe('teacher demo api', () => {
  it('opens a free class with an invite code and no students', async () => {
    const created = await createClass({ subject: 'Riyaziyyat', grade: 8, name: '8A · Riyaziyyat' });
    expect(created.inviteCode).toMatch(/^8A-MATH-/);
    expect(created.paid).toBe(false);
    expect(await fetchMembers(created.id)).toEqual([]);
    expect((await fetchClasses()).map((c) => c.id)).toContain(created.id);
  });

  it('counts a homework as checked once, even when the grade changes again', async () => {
    expect((await fetchAssignment('hw41')).toGrade).toBe(6);
    await saveGrade('sub-nermin', 9, 'Əla');
    await saveGrade('sub-nermin', 10, 'Əla');
    expect((await fetchAssignment('hw41')).toGrade).toBe(5);
  });

  it('keeps an AI draft unapproved until the teacher approves it', async () => {
    const before = (await fetchInbox()).find((q) => q.id === 'q-nermin');
    expect(before?.approved).toBe(false);
    await approveAnswer('q-nermin', before?.ai.steps ?? [], '4.3');
    expect((await fetchInbox()).find((q) => q.id === 'q-nermin')?.approved).toBe(true);
  });

  it('shows the report only for students who allowed it', async () => {
    const insights = await fetchInsights('7b');
    const members = await fetchMembers('7b');
    const hidden = members.filter((m) => !m.sharesProgress).map((m) => m.id);
    expect(insights?.rows.some((r) => hidden.includes(r.studentId))).toBe(false);
    expect(insights?.hiddenCount).toBe(hidden.length);
  });

  it('removes a member from the class and its groups', async () => {
    await removeMember('7b', 'orxan');
    expect((await fetchMembers('7b')).some((m) => m.id === 'orxan')).toBe(false);
    const cls = (await fetchClasses()).find((c) => c.id === '7b');
    expect(cls?.groups[0]?.memberIds).not.toContain('orxan');
    expect(cls?.studentCount).toBe(23);
  });
});

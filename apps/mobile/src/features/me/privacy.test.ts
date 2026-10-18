import { parentCategoryCount, privacyMatrix, type Grants } from './privacy';

const grants: Grants = {
  teacher: { progress: true, activity: false, examPlan: false },
  parent: { progress: true, activity: true, examPlan: false },
};

describe('privacyMatrix', () => {
  it('turns grants into switches and keeps fixed rules fixed', () => {
    const rows = privacyMatrix(grants);
    expect(rows.map((r) => r.category)).toEqual([
      'identity',
      'tasks',
      'progress',
      'activity',
      'examPlan',
      'messages',
      'ai',
    ]);
    expect(rows[3]?.cells[0]).toEqual({ kind: 'switch', grant: 'activity', on: false });
    expect(rows[3]?.cells[1]).toEqual({ kind: 'switch', grant: 'activity', on: true });
    // Other students never see progress, and AI chats are never shown to a parent.
    expect(rows[2]?.cells[2]).toEqual({ kind: 'no', word: 'no' });
    expect(rows[6]?.cells[1]).toEqual({ kind: 'no', word: 'no' });
  });

  it('counts what a parent sees', () => {
    expect(parentCategoryCount(grants)).toBe(4);
  });
});

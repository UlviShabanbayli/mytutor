/** Who can see a student's data besides the student (architecture: "Rollar və icazələr"). */
export const AUDIENCES = ['teacher', 'parent', 'students'] as const;
export type Audience = (typeof AUDIENCES)[number];

/** The categories a student switches on or off for a teacher or a parent. */
export type GrantKey = 'progress' | 'activity' | 'examPlan';
export type Grants = Record<'teacher' | 'parent', Record<GrantKey, boolean>>;

export type PrivacyCategory =
  'identity' | 'tasks' | 'progress' | 'activity' | 'examPlan' | 'messages' | 'ai';

/** A fixed answer of the table, or a switch the student controls. */
export type PrivacyCell =
  | {
      kind: 'yes' | 'no' | 'part';
      word: 'yes' | 'no' | 'classNameOnly' | 'ownChat' | 'under13' | 'askedOnly';
    }
  | { kind: 'switch'; grant: GrantKey; on: boolean };

const yes = { kind: 'yes', word: 'yes' } as const;
const no = { kind: 'no', word: 'no' } as const;

/** The "Kim nəyi görür" table: rows by category, cells for teacher, parent and other students. */
export function privacyMatrix(
  grants: Grants,
): { category: PrivacyCategory; cells: PrivacyCell[] }[] {
  const sw = (who: 'teacher' | 'parent', grant: GrantKey): PrivacyCell => ({
    kind: 'switch',
    grant,
    on: grants[who][grant],
  });
  return [
    { category: 'identity', cells: [yes, yes, { kind: 'part', word: 'classNameOnly' }] },
    { category: 'tasks', cells: [yes, yes, no] },
    { category: 'progress', cells: [sw('teacher', 'progress'), sw('parent', 'progress'), no] },
    { category: 'activity', cells: [sw('teacher', 'activity'), sw('parent', 'activity'), no] },
    { category: 'examPlan', cells: [sw('teacher', 'examPlan'), sw('parent', 'examPlan'), no] },
    {
      category: 'messages',
      cells: [{ kind: 'part', word: 'ownChat' }, { kind: 'part', word: 'under13' }, no],
    },
    { category: 'ai', cells: [{ kind: 'part', word: 'askedOnly' }, no, no] },
  ];
}

/** Categories a linked parent sees: name and class tasks always, plus the switched-on grants. */
export function parentCategoryCount(grants: Grants): number {
  return 2 + Object.values(grants.parent).filter(Boolean).length;
}

import type { Person, Role } from '@mytutor/types';
import { ELCIN, ELVIN, FRESH, LALE, NERMIN, RESAD, SEBINE } from './ids';

/** Everyone in the demo. Short forms ("Aysel Q.") and initials are derived from full names. */

export function person(id: string, fullName: string, roles: Role[]): Person {
  const [firstName = fullName, ...rest] = fullName.split(' ');
  const lastName = rest.length > 0 ? rest.join(' ') : null;
  const lastInitial = lastName?.[0] ?? '';
  return {
    id,
    firstName,
    lastName,
    fullName,
    shortName: lastName ? `${firstName} ${lastInitial}.` : firstName,
    // toUpperCase, not the locale-aware form, so every runtime gives the same letters.
    initials: `${firstName[0] ?? ''}${lastInitial}`.toUpperCase(),
    roles,
  };
}

/** 7B: 24 students with fixed full names, Nərmin first. `false`: does not share progress. */
export const ROSTER_7B: [id: string, fullName: string, nickname: string, shares: boolean][] = [
  [NERMIN, 'Nərmin Əliyeva', 'BalArısı_27', true],
  ['orxan', 'Orxan Məmmədov', 'Pətəkçi_09', true],
  ['aysel', 'Aysel Quliyeva', 'Ayçiçək', true],
  ['tural', 'Tural İsmayılov', 'Arıcıq_3', true],
  ['leyla', 'Leyla Rzayeva', 'Mumcuq', true],
  ['fidan', 'Fidan Həsənli', 'Riyaziyyatçı_7B', true],
  ['sebuhi', 'Səbuhi Nəsirov', 'Nektar_11', true],
  ['kamran', 'Kamran Vəliyev', 'SarıQanad', true],
  ['gunay', 'Günay Abbasova', 'Çiçəkçi_5', false],
  ['nigar', 'Nigar Mustafayeva', 'BalDamcısı', true],
  ['elnur', 'Elnur Səfərov', 'Uçan_Ləçək', true],
  ['ramil', 'Ramil Kərimov', 'QızılPətək', false],
  ['murad', 'Murad Hüseynov', 'Nektarçı', true],
  ['sevinc', 'Sevinc Bağırova', 'Gülşən_Arı', true],
  ['lamiye', 'Lamiyə Cəfərova', 'Yonca_12', false],
  ['zehra', 'Zəhra Qasımova', 'Səhər_Arısı', true],
  ['nihad', 'Nihad Rəhimov', 'KiçikArı', true],
  ['ilkin', 'İlkin Tağıyev', 'Pətək_77', false],
  ['aydan', 'Aydan Fərzəliyeva', 'Çiçək_8', true],
  ['ulviyye', 'Ülviyyə Dadaşova', 'Arı_Rəna', true],
  ['emil', 'Emil Şükürov', 'Bal_Kamal', false],
  ['rauf', 'Rauf Əsgərov', 'MəktəbArısı', true],
  ['xedice', 'Xədicə Novruzova', 'Ləçək_4', true],
  ['togrul', 'Toğrul Mirzəyev', 'Qanadlı_7', true],
];

/** 7A: enough for the teacher's counts. */
export const ROSTER_7A: string[] = [
  'Anar Babayev',
  'Aytac Qurbanova',
  'Cavid Həsənov',
  'Dilarə Məmmədova',
  'Elmir Ələkbərov',
  'Fərid Sultanov',
  'Gülnar Talıbova',
  'Həsən Rüstəmov',
  'İlahə Nağıyeva',
  'Kənan Daşdəmirov',
  'Laman Zeynalova',
  'Mələk Axundova',
  'Nurlan Kazımov',
  'Pərvin Vəliyeva',
  'Röya Cəlilova',
  'Samir Fətullayev',
  'Səidə İbrahimova',
  'Teymur Şirinov',
  'Ulviyya Qəniyeva',
  'Vüsal Paşayev',
  'Yeganə Lətifova',
  'Zaur Muradov',
];

export const rosterId7A = (index: number) => `7a-${index + 1}`;

export const PEOPLE: Person[] = [
  ...ROSTER_7B.map(([id, fullName]) => person(id, fullName, ['student'])),
  ...ROSTER_7A.map((fullName, i) => person(rosterId7A(i), fullName, ['student'])),
  person(LALE, 'Lalə Həsənova', ['teacher']),
  person(RESAD, 'Rəşad Quliyev', ['teacher']),
  person(SEBINE, 'Səbinə Əliyeva', ['parent']),
  person(ELCIN, 'Elçin Əliyev', ['parent']),
  person(ELVIN, 'Elvin Əliyev', ['student']),
  // The first-day student has not given a name; this is only the demo switch's label.
  person(FRESH, 'Yeni şagird', ['student']),
];

const byId = new Map(PEOPLE.map((p) => [p.id, p]));

export function personById(id: string): Person {
  const found = byId.get(id);
  if (!found) throw new Error(`Unknown demo person ${id}`);
  return found;
}

/** "Lalə müəllim": how students and parents name a teacher. */
export const teacherTitle = (id: string) => `${personById(id).firstName} müəllim`;

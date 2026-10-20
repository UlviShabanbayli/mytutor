import type { MascotMood } from '../../moodArt';
import type { ExprKey } from './faces';
import type { AntKey, ArmLKey, ArmRKey, WingKey } from './poses';

/** A prop Vızı holds in the right hand. */
export type PropKey = 'pointer' | 'mag' | 'lens';

/** A whole-body pose: face, arms, antennae, wings and a held prop. */
export type Pose = {
  e: ExprKey;
  al: ArmLKey;
  ar: ArmRKey;
  ant: AntKey;
  w: WingKey;
  prop: PropKey | null;
};

const BASE = { ant: 'normal', w: 'normal', prop: null } as const;

/** The rig's poses, one per mood drawing plus a few in-between ones (motion lab "POSE"). */
export const POSES = {
  rest: { ...BASE, e: 'hero', al: 'down', ar: 'down' },
  hero: { ...BASE, e: 'hero', al: 'down', ar: 'wave' },
  sevinc: { ...BASE, e: 'sevinc', al: 'down', ar: 'down' },
  bayram: { ...BASE, e: 'bayram', al: 'up', ar: 'up', ant: 'cheer', w: 'cheer' },
  dusunur: { ...BASE, e: 'dusunur', al: 'down', ar: 'chin', ant: 'think' },
  izah: { ...BASE, e: 'izah', al: 'down', ar: 'point', ant: 'explain', prop: 'pointer' },
  point: { ...BASE, e: 'izah', al: 'down', ar: 'point', ant: 'explain' },
  fokus: { ...BASE, e: 'fokus', al: 'down', ar: 'down', ant: 'focus' },
  teeccub: { ...BASE, e: 'teeccub', al: 'hands', ar: 'hands', ant: 'alert', w: 'cheer' },
  teselli: { ...BASE, e: 'teselli', al: 'open', ar: 'open', ant: 'soft' },
  darixdim: { ...BASE, e: 'wist', al: 'hang', ar: 'hang', ant: 'droop', w: 'droop' },
  yuxulu: { ...BASE, e: 'yuxulu', al: 'hang', ar: 'hang', ant: 'sleepy', w: 'sleepy' },
  yatir: { ...BASE, e: 'yatir', al: 'hang', ar: 'hang', ant: 'sleepy', w: 'sleepy' },
  ucur: { ...BASE, e: 'ucur', al: 'fly', ar: 'fly', ant: 'fly', w: 'fly' },
  kesfiyyat: { ...BASE, e: 'kesfiyyat', al: 'down', ar: 'lens', prop: 'lens' },
  lupa: { ...BASE, e: 'down', al: 'down', ar: 'hold', ant: 'focus', prop: 'mag' },
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

/** The rig pose that matches each mood drawing. */
export const MOOD_POSE: Record<MascotMood, PoseName> = {
  hero: 'hero',
  salam: 'hero',
  sevinc: 'sevinc',
  bayram: 'bayram',
  dusunur: 'dusunur',
  izah: 'izah',
  fokus: 'fokus',
  teeccub: 'teeccub',
  teselli: 'teselli',
  darixdim: 'darixdim',
  yuxulu: 'yuxulu',
  ucur: 'ucur',
  kesfiyyat: 'kesfiyyat',
};

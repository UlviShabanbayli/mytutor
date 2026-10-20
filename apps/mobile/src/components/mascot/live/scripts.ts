import { playCue } from '@/lib/cues';
import type { ExprKey } from '../rig/data/faces';
import type { PoseName } from '../rig/data/scenes';
import { backOut, ease } from '../rig/ease';
import { flapBurst } from '../rig/moves/flap';
import type { LifeOptions } from '../rig/moves/life';
import { faceTo, poseTo } from '../rig/moves/pose';
import { blink, hop, look, nod, spinTurn, wink, wobble } from '../rig/moves/small';
import type { Rig } from '../rig/rigValues';
import type { Scope } from '../rig/scope';
import type { Timeline } from '../rig/timeline';

export type ScriptContext = {
  rig: Rig;
  S: Scope;
  speak: (text: string | null) => void;
  say?: string;
};

/** A moment Vızı plays by itself: a start pose, idle life, a one-off timeline and/or a loop. */
export type Script = {
  pose: PoseName;
  life: LifeOptions;
  /** The still frame under reduced motion. */
  reduced: { pose: PoseName; face?: ExprKey };
  /** Changes the first frame (e.g. hidden before popping in). */
  init?: (rig: Rig) => void;
  once?: (tl: Timeline, c: ScriptContext) => void;
  loop?: { period: number; build: (tl: Timeline, rig: Rig) => void };
};

/** vizi.correct C «Göz vurur»: pops in, spins with a 14-unit hop, grins, winks, «Əla!». */
const correct: Script = {
  pose: 'rest',
  life: { hover: 3 },
  reduced: { pose: 'rest', face: 'grin' },
  init: (rig) => {
    rig.v.hostOpacity.value = 0;
    rig.v.hostScale.value = 0.7;
  },
  once: (tl, { rig, speak, say }) => {
    const v = rig.v;
    tl.to(v.hostOpacity, 1, 0.32, 0.2, ease.p2out).to(v.hostScale, 1, 0.32, 0.32, backOut(2.4));
    hop(tl, rig, 14, 0.4);
    spinTurn(tl, rig, 0.45, 0.55);
    faceTo(tl, rig, 'grin', 0.7, 0.2);
    wink(tl, rig, 0.4, 1.1);
    tl.call(1.1, () => playCue('press'))
      .to(v.cheekS, 1.25, 1.1, 0.2, ease.back3)
      .call(1.15, () => speak(say ?? null))
      .to(v.cheekS, 1, 2, 0.3);
    faceTo(tl, rig, 'happy', 2.1, 0.3);
  },
};

/** vizi.wrong A «Sakit baxış»: a kind face, a head tilt, two slow nods, a warm smile. No haptic. */
const wrong: Script = {
  pose: 'rest',
  life: { hover: 3, flap: 'rest' },
  reduced: { pose: 'rest', face: 'teselli' },
  once: (tl, { rig }) => {
    faceTo(tl, rig, 'teselli', 0.45, 0.5);
    tl.to(rig.v.spin, -6, 0.5, 0.7, ease.sineIO);
    nod(tl, rig, 1.25, 4);
    wobble(tl, rig, -6, 1.25);
    tl.to(rig.v.spin, 0, 2.55, 0.8, ease.sineIO);
    faceTo(tl, rig, 'happy', 2.65, 0.5);
  },
};

/** vizi.done A «Bal damcıları»: arms up, a 24-unit hop, 1.8s of fast wings, laughs and hops. */
const done: Script = {
  pose: 'rest',
  life: { hover: 4 },
  reduced: { pose: 'bayram' },
  once: (tl, { rig, S }) => {
    poseTo(tl, rig, 'bayram', 0.3, 0.25);
    hop(tl, rig, 24, 0.3);
    tl.call(0.3, () => flapBurst(S, rig, 1.8));
    faceTo(tl, rig, 'sevinc', 2.2, 0.2);
    hop(tl, rig, 14, 2.3);
    poseTo(tl, rig, 'rest', 3.2, 0.45);
    faceTo(tl, rig, 'happy', 3.3, 0.3);
  },
};

/** vizi.think C «Hüceyrələr dolur»: focused; the eyes follow three cells filling, then a blink. */
const think: Script = {
  pose: 'fokus',
  // The loop blinks in step with the cells, so idle blinks stay off.
  life: { hover: 3, flap: 'rest', blink: false },
  reduced: { pose: 'fokus' },
  loop: {
    period: 2.8,
    build: (tl, rig) => {
      [0, 1, 2].forEach((i) => look(tl, rig, 3 + i * 3, 3, i * 0.6, 0.25));
      blink(tl, rig, 1.9);
      look(tl, rig, 0, 0, 2, 0.3);
    },
  },
};

export const SCRIPTS = { correct, wrong, done, think } as const;
export type ScriptName = keyof typeof SCRIPTS;

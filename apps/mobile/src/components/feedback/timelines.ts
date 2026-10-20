/**
 * Choreography of the approved feedback samples (docs/design/motion.md, "Cavab anları və
 * mükafatlar"; read from the lab's timelines in motion-lab.html). Times are milliseconds from the
 * start of the moment. Shared durations, easings and springs come from '@/motion'; what is here
 * belongs to one sample each: its offsets, staggers and sizes.
 */

/** feedback.select B: the chosen option lifts 2pt, its letter pops. */
export const selectB = { lift: -2, letterUp: 90, letterPeak: 1.18 } as const;

/** feedback.correct B: the option breathes, the panel springs up, badge and points pop. */
export const correctB = {
  breathe: 1.03,
  panelAt: 450,
  badgeAt: 150,
  checkAt: 250,
  pillAt: 350,
  pill: 300,
  pillFrom: 0.6,
} as const;

/** feedback.wrong C: the right option shows 350ms later, then the warm panel and Vızı peek. */
export const wrongC = {
  rightAt: 350,
  panelAt: 800,
  peekAt: 250,
  peekRise: 450,
  peekFrom: 30,
  nodAt: 750,
  nodHalf: 200,
  nodDeg: -6,
} as const;

/** feedback.points C: 8 drops stream into the counter, whose drop fills, then drains. */
export const pointsC = {
  /** After "Yoxla": the panel is up and its "+10 bal" pill has popped. */
  startAt: 950,
  drops: 8,
  stagger: 50,
  flight: 550,
  levelStep: 150,
  drainDelay: 350,
  chipDelay: 300,
  chipIn: 250,
  chipOut: 450,
} as const;

/** feedback.streak C: Vızı flies a 1.2s arc over today's hex, the number rolls, she bobs. */
export const streakC = {
  startAt: 500,
  flight: 1200,
  fillAt: 550,
  rollAt: 950,
  rollOut: 220,
  rollGap: 80,
  rollIn: 260,
  bobAt: 1250,
  bobHalf: 300,
  bob: -6,
  size: 56,
} as const;

/** feedback.goal C: a drop rides the arc's head, falls into the centre, honey rises, check. */
export const goalC = {
  startAt: 500,
  from: 0.75,
  fall: 300,
  honeyAt: 250,
  honey: 500,
  checkAt: 600,
} as const;

/** feedback.lessondone B: Vızı springs in, nectar rises with a wave, tiles pop. */
export const lessonDoneB = {
  mascot: 500,
  mascotFrom: 0.6,
  headsAt: 200,
  headStagger: 120,
  waveAt: 500,
  wave: 1200,
  fillAt: 550,
  fill: 1200,
  tilesAt: 1200,
  tileStagger: 150,
  tileFrom: 0.8,
  count: 900,
  ctaAt: 2000,
} as const;

/** feedback.rankup B: the seal draws, fills and pops; the title rises word by word. */
export const rankUpB = {
  outlineAt: 100,
  outline: 450,
  fillAt: 500,
  iconAt: 850,
  icon: 350,
  pulse: 700,
  wordsAt: 1000,
  wordStagger: 80,
  textAt: 1250,
  ladderAt: 1400,
  ctaAt: 1700,
} as const;

/** feedback.score C: numbered cells pop around the score one by one, the score pops last. */
export const scoreC = {
  startAt: 400,
  stagger: 90,
  cell: 250,
  tickAfter: 120,
  midAfter: 200,
  midPop: 350,
  midFrom: 0.85,
  /** The message and tiles fade up just after the score pops. */
  outsAfter: 100,
} as const;

/** When the score pops after `cells` cells have popped (feedback.score C). */
export const scoreEnd = (cells: number) =>
  scoreC.startAt + cells * scoreC.stagger + scoreC.midAfter;

/** The lab's fade-up of texts: 8pt and 220ms (duration.base). */
export const fadeUpBy = 8;

import { useEffect, useState } from 'react';
import {
  cancelAnimation,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { TALK_KEYS } from '../rig/data/faces';
import { ease } from '../rig/ease';
import { mouthOnUI } from '../rig/moves/mouthUI';
import { faceTo } from '../rig/moves/pose';
import type { Rig } from '../rig/rigValues';
import { Timeline } from '../rig/timeline';

/** A spoken word and when it is said, in seconds (e.g. Azure TTS word boundaries). */
export type NarratorWord = { text: string; start: number; end: number };

/** "All words said": every caption word is lit as done. */
export const ALL_SAID = 10000;

/**
 * Drives Vızı's voice-over from word timestamps (vizi.explain C): the current caption word, a
 * new mouth viseme every 130ms while a word is spoken (on the UI thread), a voice-meter tick
 * every 100ms, and a closed smile after the sentence. Without `position` it runs its own clock
 * and repeats the sentence after a 1.2s pause (the gallery demo).
 */
export function useNarration(
  rig: Rig,
  words: NarratorWord[],
  active: boolean,
  position?: SharedValue<number>,
) {
  const first = words[0]?.start ?? 0;
  const last = words[words.length - 1]?.end ?? 0;
  const clock = useSharedValue(0);
  const mouth = useSharedValue(rig.model.mouth);
  const [said, setSaid] = useState(false);
  const starts = words.map((w) => w.start);
  const v = rig.v;

  useEffect(() => {
    if (position || !active) return;
    clock.set(0);
    clock.set(
      withRepeat(
        withTiming(last + 1.7, { duration: (last + 1.7) * 1000, easing: ease.none }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(clock);
  }, [position, active, clock, last]);

  const time = useDerivedValue(() => (position ? position.value : clock.value));
  const current = useDerivedValue(() => {
    const t = time.value;
    if (t >= last) return ALL_SAID;
    let i = -1;
    for (let j = 0; j < starts.length; j++) if (t >= (starts[j] ?? 0)) i = j;
    return i;
  });
  const talking = useDerivedValue(() => time.value >= first && time.value < last);
  const viseme = useDerivedValue(() => (talking.value ? Math.floor(time.value / 0.13) : -1));
  const meter = useDerivedValue(() => (talking.value ? Math.floor(time.value / 0.1) : -1));

  useAnimatedReaction(
    () => viseme.value,
    (tick, prev) => {
      if (tick === prev || !active) return;
      if (tick < 0) mouthOnUI(v, mouth, 'smile', 0.12);
      else
        mouthOnUI(v, mouth, TALK_KEYS[(tick * 5 + (tick >> 1)) % TALK_KEYS.length] ?? 'talk', 0.08);
    },
    [active],
  );
  useAnimatedReaction(
    () => time.value >= last,
    (done, prev) => {
      if (done !== prev) scheduleOnRN(setSaid, done);
    },
  );
  useEffect(() => {
    if (!active) return;
    const tl = new Timeline();
    faceTo(tl, rig, said ? 'happy' : 'izah', 0, 0.3, false);
    tl.play();
    return () => tl.kill();
  }, [said, active, rig]);

  return { current, meter };
}

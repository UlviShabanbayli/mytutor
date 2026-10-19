import { useEffect, useState } from 'react';
import { MOOD_POSE } from './rig/data/scenes';
import { createRig } from './rig/moves/pose';
import { disposeRig } from './rig/rigValues';
import { ViziRig } from './rig/ViziRig';
import type { MascotMood } from './moodArt';

type RigPoseProps = { mood: MascotMood; size: number };

/** The rig standing still in a mood's pose (to compare it with the drawing in the gallery). */
export function RigPose({ mood, size }: RigPoseProps) {
  const [rig] = useState(() => createRig(MOOD_POSE[mood]));
  useEffect(() => () => disposeRig(rig.v), [rig]);
  return <ViziRig rig={rig} size={size} />;
}

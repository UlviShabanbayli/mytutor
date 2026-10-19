import { ClipPath, Defs, Ellipse, G, Path } from 'react-native-svg';
import { BODY_PATH, VIZI } from '../data/colors';

type RigTorsoProps = { clipId: string };

/** The still body: tuft, body and its clipped shading, stripes and highlight (as in every mood). */
export function RigTorso({ clipId }: RigTorsoProps) {
  return (
    <>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={BODY_PATH} />
        </ClipPath>
      </Defs>
      <Path d="M90 36 C90 22 100 20 102 30 C104 18 118 22 112 36 Z" fill={VIZI.body} />
      <Path d={BODY_PATH} fill={VIZI.body} />
      <G clipPath={`url(#${clipId})`}>
        <Ellipse cx={160} cy={130} rx={34} ry={80} fill={VIZI.shade} />
        <Path d="M20 134 Q100 150 180 134 V152 Q100 168 20 152 Z" fill={VIZI.ink} />
        <Path d="M20 166 Q100 182 180 166 V200 H20 Z" fill={VIZI.ink} />
        <Ellipse cx={62} cy={60} rx={16} ry={9} transform="rotate(-35 62 60)" fill={VIZI.hi} />
      </G>
    </>
  );
}

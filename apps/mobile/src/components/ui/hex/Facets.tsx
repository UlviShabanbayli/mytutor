import { G, Line } from 'react-native-svg';
import { useThemeColors } from '@/theme';

type FacetsProps = {
  w: number;
  h: number;
  clipId: string;
};

/** The two frost lines of a cell that needs practice (surf, 1pt; the parent sets opacity). */
export function Facets({ w, h, clipId }: FacetsProps) {
  const c = useThemeColors();
  return (
    <G clipPath={`url(#${clipId})`} stroke={c.surf} strokeWidth={1}>
      <Line x1={w * 0.2} y1={h * 0.3} x2={w * 0.5} y2={h * 0.55} />
      <Line x1={w * 0.5} y1={h * 0.55} x2={w * 0.8} y2={h * 0.35} />
    </G>
  );
}

import { G, Polygon, Rect } from 'react-native-svg';
import { useThemeColors } from '@/theme';
import type { CellState } from '../HexCell';
import { Facets } from './Facets';
import type { CellGeometry } from './geometry';

type CellShapesProps = {
  geo: CellGeometry;
  state: CellState;
  /** The selected or current topic: the inverted `spot` fill. */
  selected?: boolean;
};

/**
 * The still art of one level, as SVG children (the parent Svg defines the clip): wax, half
 * nectar, honey, a wax cap on sealed honey, or crystal with two frost lines.
 */
export function CellShapes({ geo, state, selected = false }: CellShapesProps) {
  const c = useThemeColors();
  const { w, h } = geo;
  const fill = {
    not_started: c.wax,
    lesson_completed: c.wax,
    mastered: c.honey,
    reinforced: c.sealed,
    needs_practice: c.crystal,
  }[state];

  return (
    <>
      {/* Selected: the inverted `spot` color, never `ink` (it turns white in dark mode). */}
      <Polygon points={geo.outer} fill={selected ? c.spot : fill} />
      {state === 'lesson_completed' && !selected ? (
        <G clipPath={`url(#${geo.clipId})`}>
          <Rect x={0} y={geo.nectarTop} width={w} height={h - geo.nectarTop} fill={c.nectar} />
        </G>
      ) : null}
      {state === 'needs_practice' && !selected ? (
        <G opacity={0.6}>
          <Facets w={w} h={h} clipId={geo.clipId} />
        </G>
      ) : null}
      {state === 'reinforced' ? (
        <Polygon points={geo.cap} fill={selected ? c.honey : c.cap} />
      ) : null}
    </>
  );
}

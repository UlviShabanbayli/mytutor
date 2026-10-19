import Svg, { ClipPath, Defs, Polygon } from 'react-native-svg';
import type { CellState } from '../HexCell';
import { CellShapes } from './CellShapes';
import type { CellGeometry } from './geometry';

type CellArtProps = {
  geo: CellGeometry;
  state: CellState;
  selected?: boolean;
};

/** A cell's still art in its own Svg, laid over the cell box. */
export function CellArt({ geo, state, selected }: CellArtProps) {
  return (
    <Svg width={geo.w} height={geo.h} style={{ position: 'absolute' }}>
      <Defs>
        <ClipPath id={geo.clipId}>
          <Polygon points={geo.outer} />
        </ClipPath>
      </Defs>
      <CellShapes geo={geo} state={state} selected={selected} />
    </Svg>
  );
}

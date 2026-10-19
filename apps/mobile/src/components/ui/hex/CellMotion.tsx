import { useEffect, useState } from 'react';
import Svg, { ClipPath, Defs, G, Polygon } from 'react-native-svg';
import { playCue } from '@/lib/cues';
import { useThemeColors } from '@/theme';
import type { CellState } from '../HexCell';
import { CellShapes } from './CellShapes';
import { cellTimeline, type CellMotionKind, GRAINS } from './levelChange';
import { Facets } from './Facets';
import { Fade } from './Fade';
import type { CellGeometry } from './geometry';
import { Grain } from './Grain';
import { HoneyGlow } from './HoneyGlow';
import { Liquid } from './Liquid';
import { Trace } from './Trace';

type CellMotionProps = {
  geo: CellGeometry;
  kind: CellMotionKind;
  from: CellState;
  to: CellState;
  /** Wait before the change starts, in ms. */
  delay: number;
  /** No haptic: the screen around it plays its own cue. */
  quiet?: boolean;
};

const at = (span: readonly [number, number], delay: number) => span[0] + delay;

/**
 * Plays one approved level change over the old level's art, then shows the new level's
 * still art, so the end is exactly what `HexCell` draws for `to`.
 */
export function CellMotion({ geo, kind, from, to, delay, quiet = false }: CellMotionProps) {
  const c = useThemeColors();
  const [done, setDone] = useState(false);
  const t = cellTimeline;

  useEffect(() => {
    const timers = [setTimeout(() => setDone(true), delay + t[kind].end)];
    if (kind === 'seal' && !quiet) {
      timers.push(setTimeout(() => playCue('press'), delay + t.seal.cue));
    }
    return () => timers.forEach(clearTimeout);
  }, [delay, kind, quiet, t]);

  const fromTop = from === 'lesson_completed' ? geo.nectarTop : geo.h;

  return (
    <>
      {kind === 'honey' && !done ? (
        <HoneyGlow w={geo.w} h={geo.h} at={at(t.honey.glow, delay)} duration={t.honey.glow[1]} />
      ) : null}
      <Svg width={geo.w} height={geo.h} style={{ position: 'absolute' }}>
        <Defs>
          <ClipPath id={geo.clipId}>
            <Polygon points={geo.outer} />
          </ClipPath>
        </Defs>
        <CellShapes geo={geo} state={done ? to : from} />
        {done ? null : kind === 'fill' ? (
          <Liquid
            geo={geo}
            color={c.nectar}
            fromTop={geo.h}
            toTop={geo.nectarTop}
            at={at(t.fill.rise, delay)}
            duration={t.fill.rise[1]}
          />
        ) : kind === 'honey' ? (
          <>
            <Liquid
              geo={geo}
              color={c.nectar}
              fromTop={fromTop}
              toTop={0}
              at={at(t.honey.rise, delay)}
              duration={t.honey.rise[1]}
            />
            <Fade at={at(t.honey.colour, delay)} duration={t.honey.colour[1]}>
              <Polygon points={geo.outer} fill={c.honey} />
            </Fade>
          </>
        ) : kind === 'seal' ? (
          <>
            <Fade at={at(t.seal.darken, delay)} duration={t.seal.darken[1]}>
              <Polygon points={geo.outer} fill={c.sealed} />
            </Fade>
            <Fade at={at(t.seal.cap, delay)} duration={t.seal.cap[1]}>
              <Polygon points={geo.cap} fill={c.cap} />
            </Fade>
            <Trace
              d={geo.capPath}
              length={geo.capLength}
              color={c.cap}
              width={Math.max(1.5, geo.w * 0.027)}
              drawAt={at(t.seal.trace, delay)}
              drawFor={t.seal.trace[1]}
              outAt={at(t.seal.traceOut, delay)}
              outFor={t.seal.traceOut[1]}
            />
          </>
        ) : (
          <>
            <Fade at={at(t.crystal.frost, delay)} duration={t.crystal.frost[1]}>
              <Polygon points={geo.outer} fill={c.crystal} />
            </Fade>
            <Fade
              at={at(t.crystal.grainsOut, delay)}
              duration={t.crystal.grainsOut[1]}
              from={1}
              to={0}
            >
              <G clipPath={`url(#${geo.clipId})`}>
                {GRAINS.map(([x, y], i) => (
                  <Grain
                    key={`${x}-${y}`}
                    cx={(geo.w * x) / 100}
                    cy={(geo.h * y) / 100}
                    w={geo.w * 0.18}
                    h={geo.h * 0.18}
                    color={c.crystal}
                    at={delay + t.crystal.grains + i * t.crystal.grainStep}
                    duration={t.crystal.grain}
                  />
                ))}
              </G>
            </Fade>
            <Fade at={at(t.crystal.facets, delay)} duration={t.crystal.facets[1]} to={0.6}>
              <Facets w={geo.w} h={geo.h} clipId={geo.clipId} />
            </Fade>
          </>
        )}
      </Svg>
    </>
  );
}

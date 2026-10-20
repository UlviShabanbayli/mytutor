import { Animated } from 'react-native';
import { fadeScene, slideScene } from './tabScene';

/** Animated nodes expose their current value to tests through `__getValue`. */
type Node = { __getValue: () => number };

function sceneAt(progress: number, width = 400) {
  const value = new Animated.Value(progress);
  const { sceneStyle } = slideScene(width)({ current: { progress: value } });
  const style = sceneStyle as unknown as { transform: { translateX: Node }[] };
  return style.transform.map((t) => t.translateX.__getValue())[0] ?? Number.NaN;
}

describe('tab pager', () => {
  it('keeps the active tab in place and the others one width away', () => {
    expect(sceneAt(0)).toBe(0);
    expect(sceneAt(1)).toBe(400);
    expect(sceneAt(-1)).toBe(-400);
  });

  it('moves both pages together halfway through', () => {
    // The new tab (1 → 0) and the old one (0 → -1) stay side by side.
    expect(sceneAt(0.5) - sceneAt(-0.5)).toBe(400);
  });

  it('fades instead of sliding with less motion', () => {
    const value = new Animated.Value(1);
    const { sceneStyle } = fadeScene({ current: { progress: value } });
    const style = sceneStyle as unknown as { opacity: Node };
    expect(style.opacity.__getValue()).toBe(0);
  });
});

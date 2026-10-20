import { cellMotionKind, cellTimeline } from './levelChange';

describe('cellMotionKind', () => {
  it('maps each approved level change to its motion', () => {
    expect(cellMotionKind('not_started', 'lesson_completed')).toBe('fill');
    expect(cellMotionKind('lesson_completed', 'mastered')).toBe('honey');
    expect(cellMotionKind('not_started', 'mastered')).toBe('honey');
    expect(cellMotionKind('mastered', 'reinforced')).toBe('seal');
    expect(cellMotionKind('mastered', 'needs_practice')).toBe('crystal');
    expect(cellMotionKind('reinforced', 'needs_practice')).toBe('crystal');
  });

  it('plays nothing for no change or a step back', () => {
    expect(cellMotionKind('mastered', 'mastered')).toBeNull();
    expect(cellMotionKind('needs_practice', 'mastered')).toBeNull();
    expect(cellMotionKind('mastered', 'lesson_completed')).toBeNull();
    expect(cellMotionKind('reinforced', 'not_started')).toBeNull();
  });
});

describe('cellTimeline', () => {
  it('ends every change after its last step', () => {
    const t = cellTimeline;
    expect(t.fill.end).toBeGreaterThanOrEqual(t.fill.rise[0] + t.fill.rise[1]);
    expect(t.honey.end).toBeGreaterThanOrEqual(t.honey.glow[0] + t.honey.glow[1]);
    expect(t.seal.end).toBeGreaterThanOrEqual(t.seal.darken[0] + t.seal.darken[1]);
    expect(t.crystal.end).toBeGreaterThanOrEqual(t.crystal.facets[0] + t.crystal.facets[1]);
    expect(t.crystal.end).toBeGreaterThanOrEqual(t.crystal.grains + 6 * t.crystal.grainStep);
  });
});

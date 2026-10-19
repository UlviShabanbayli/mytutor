import { spring } from './tokens';

describe('spring presets', () => {
  it('all set their mass (Reanimated 4 would otherwise use 4, the lab uses 1)', () => {
    for (const [name, config] of Object.entries(spring)) {
      expect([name, typeof config.mass]).toEqual([name, 'number']);
    }
  });
});

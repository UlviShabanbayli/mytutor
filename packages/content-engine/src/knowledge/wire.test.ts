import { describe, expect, it } from 'vitest';
import type { WireItem } from '@mytutor/types';
import { fromWire } from './wire';

const blank: Omit<WireItem, 'type' | 'ref'> = {
  origin: 'textbook',
  sources: [{ blockId: 'b03', lineIds: ['l020'], figureId: '' }],
  readFrom: 'image',
  concept: '',
  statement: '',
  latex: '',
  name: '',
  spoken: '',
  label: '',
  problem: { text: '', latex: '' },
  steps: [],
  explanation: '',
  number: '',
  instruction: '',
  items: [],
  text: '',
  description: '',
  labels: [],
  term: '',
  context: '',
};

describe('fromWire', () => {
  it('keeps only the fields of the item type', () => {
    const { items, rejected } = fromWire([
      { ...blank, type: 'formula', ref: 'k1', latex: '(a+b)^2', spoken: 'x', statement: 'stray' },
      { ...blank, type: 'exercise', ref: 'k2', number: '1', instruction: 'Yazın.' },
    ]);
    expect(rejected).toEqual([]);
    expect(items[0]).toEqual({
      type: 'formula',
      ref: 'k1',
      origin: 'textbook',
      sources: [{ blockId: 'b03', lineIds: ['l020'], figureId: null }],
      readFrom: 'image',
      name: null,
      latex: '(a+b)^2',
      spoken: 'x',
    });
    expect(items[1]).toMatchObject({ type: 'exercise', items: [] });
  });

  it('rejects items missing required fields for their type', () => {
    const { items, rejected } = fromWire([{ ...blank, type: 'formula', ref: 'k1', spoken: 'x' }]);
    expect(items).toEqual([]);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toContain('latex');
  });
});

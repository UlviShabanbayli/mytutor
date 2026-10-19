import { describe, expect, it } from 'vitest';
import { knowledgeCheckSchema, knowledgeItemSchema } from './knowledge';

const item = {
  id: 'k001',
  type: 'question',
  status: 'textbook',
  claimedOrigin: 'textbook',
  readFrom: 'image',
  sources: [
    {
      blockId: 'b02',
      lineIds: [],
      figureId: 'f01',
      regions: [{ page: 24, printedPage: 22, bbox: { x: 0, y: 0, width: 1, height: 1 } }],
      crops: ['crops/b02-1.png', 'figures/f01.png'],
    },
  ],
  content: { text: 'Koordinatlar şəkildə verilib.', latex: null },
  checks: [{ name: 'source_ids', result: 'pass', detail: null }],
};

describe('knowledgeCheckSchema', () => {
  it('accepts the figure check', () => {
    const check = { name: 'figure_link', result: 'fail', detail: 'fiqur tapılmadı' };
    expect(knowledgeCheckSchema.parse(check)).toEqual(check);
    expect(knowledgeCheckSchema.safeParse({ ...check, name: 'figure' }).success).toBe(false);
  });

  it('still reads items stored before the figure check existed', () => {
    expect(knowledgeItemSchema.safeParse(item).success).toBe(true);
    const checks = [...item.checks, { name: 'figure_link', result: 'pass', detail: null }];
    expect(knowledgeItemSchema.safeParse({ ...item, checks }).success).toBe(true);
  });
});

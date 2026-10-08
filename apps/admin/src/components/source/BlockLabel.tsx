import { useTranslation } from 'react-i18next';
import type { SourceBlock } from '@mytutor/types';

/** "NÜMUNƏ 1 · Cəmin kvadratı": the label as printed, falling back to the block kind. */
export function useBlockLabel() {
  const { t } = useTranslation();
  return (block: SourceBlock) => {
    const head = block.label ?? t(`source.kind.${block.kind}`);
    const number = block.number && !head.includes(block.number) ? ` ${block.number}` : '';
    return [`${head}${number}`, block.title].filter(Boolean).join(' · ');
  };
}

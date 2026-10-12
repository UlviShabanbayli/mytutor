import { useTranslation } from 'react-i18next';
import type { StandardSet, KnowledgeItem } from '@mytutor/types';
import { withItemCodes } from '@/features/standards/links';
import type { BookStandards } from '@/features/standards/useBookStandards';
import { StandardLinkEditor } from './StandardLinkEditor';

type ItemStandardsProps = {
  topic: string;
  item: KnowledgeItem;
  items: KnowledgeItem[];
  codes: string[];
  standardSet: StandardSet;
  bs: BookStandards;
};

/** The standards one knowledge item covers, inside its card in the Bilik tab. */
export function ItemStandards({ topic, item, items, codes, standardSet, bs }: ItemStandardsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-muted/60 px-3 py-2">
      <span className="text-xs text-muted-foreground">{t('links.itemStandards')}</span>
      <StandardLinkEditor
        compact
        subject={`${item.id} · ${t(`knowledge.type.${item.type}`)}`}
        codes={codes}
        standards={standardSet.standards}
        save={bs.save}
        apply={(next) => withItemCodes(bs.links, topic, items, item.id, next)}
      />
    </div>
  );
}

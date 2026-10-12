import { useTranslation } from 'react-i18next';
import type { Curriculum, KnowledgeItem } from '@mytutor/types';
import { withItemCodes } from '@/features/curriculum/links';
import type { BookCurriculum } from '@/features/curriculum/useBookCurriculum';
import { StandardLinkEditor } from './StandardLinkEditor';

type ItemStandardsProps = {
  topic: string;
  item: KnowledgeItem;
  items: KnowledgeItem[];
  codes: string[];
  curriculum: Curriculum;
  bc: BookCurriculum;
};

/** The standards one knowledge item covers, inside its card in the Bilik tab. */
export function ItemStandards({ topic, item, items, codes, curriculum, bc }: ItemStandardsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-muted/60 px-3 py-2">
      <span className="text-xs text-muted-foreground">{t('links.itemStandards')}</span>
      <StandardLinkEditor
        compact
        subject={`${item.id} · ${t(`knowledge.type.${item.type}`)}`}
        codes={codes}
        standards={curriculum.standards}
        save={bc.save}
        apply={(next) => withItemCodes(bc.links, topic, items, item.id, next)}
      />
    </div>
  );
}

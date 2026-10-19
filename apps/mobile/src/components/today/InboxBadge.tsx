import { Icon, Text } from '@/components/ui';
import type { InboxItem } from '@/features/today/types';
import type { ColorName } from '@/theme';
import { HexShape } from './HexShape';

type InboxBadgeProps = {
  item: InboxItem;
};

type BadgeLook = { fill: ColorName; textClass: string; text: string };

function look(item: InboxItem): BadgeLook | null {
  switch (item.kind) {
    case 'answerReady':
      return null;
    case 'newAssignment':
      return { fill: 'raised', textClass: 'text-honey-text', text: item.className };
    case 'reviewDue':
      return { fill: 'crystal', textClass: 'text-crystal-ink', text: String(item.cells) };
    case 'streak':
      return { fill: 'honey', textClass: 'text-on-honey', text: String(item.days) };
    case 'weeklySummary':
      return { fill: 'info-bg', textClass: 'text-info', text: '%' };
  }
}

/** The hexagon at the start of a notification: what it is about at a glance. */
export function InboxBadge({ item }: InboxBadgeProps) {
  const l = look(item);
  if (!l) {
    // An approved answer: the "correct" check, never color alone (the title says it too).
    return (
      <HexShape width={40} height={44} fill="ok-bg">
        <Icon name="check" size={20} color="ok" />
      </HexShape>
    );
  }
  return (
    <HexShape width={40} height={44} fill={l.fill}>
      <Text className={`font-sans-black text-sm ${l.textClass}`}>{l.text}</Text>
    </HexShape>
  );
}

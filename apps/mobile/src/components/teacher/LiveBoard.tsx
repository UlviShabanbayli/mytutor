import { Pressable, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

export type BoardTool = 'pen' | 'image';

type LiveBoardProps = {
  heading: string;
  lines: string[];
  tool: BoardTool;
  onTool: (tool: BoardTool) => void;
  onClear: () => void;
};

const GRID = Array.from({ length: 18 }, (_, i) => (i + 1) * 24);

/** The whiteboard on squared paper: the rule in large type, worked examples in honey. */
export function LiveBoard({ heading, lines, tool, onTool, onClear }: LiveBoardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [rule, ...examples] = lines;
  const tools: { key: BoardTool | 'clear'; icon: IconName; label: string }[] = [
    { key: 'pen', icon: 'edit', label: t('teacher.live.pen') },
    { key: 'image', icon: 'image', label: t('teacher.live.image') },
    { key: 'clear', icon: 'trash', label: t('teacher.live.clear') },
  ];

  return (
    <View
      accessibilityLabel={t('teacher.live.board')}
      className="h-[248px] gap-2.5 overflow-hidden rounded-xl border border-border bg-surf px-3.5 py-3"
    >
      <View aria-hidden className="absolute inset-0">
        <Svg width="100%" height="100%">
          {GRID.map((p) => (
            <Line
              key={`h${p}`}
              x1="0"
              y1={p}
              x2="2000"
              y2={p}
              stroke={colors.wax}
              strokeWidth={1}
            />
          ))}
          {GRID.map((p) => (
            <Line
              key={`v${p}`}
              x1={p}
              y1="0"
              x2={p}
              y2="2000"
              stroke={colors.wax}
              strokeWidth={1}
            />
          ))}
        </Svg>
      </View>
      <Text variant="overline" tone="muted">
        {heading}
      </Text>
      {rule ? (
        <Text className="font-sans-black text-2xl">{rule}</Text>
      ) : (
        <Text tone="muted">{t('teacher.live.cleared')}</Text>
      )}
      {examples.map((line) => (
        <Text key={line} className="font-sans-bold text-lg text-honey-text">
          {line}
        </Text>
      ))}
      <View
        accessibilityRole="toolbar"
        accessibilityLabel={t('teacher.live.tools')}
        className="absolute bottom-2.5 right-2.5 flex-row gap-1 rounded-md border border-border bg-surf p-0.5"
      >
        {tools.map((x) => {
          const on = x.key === tool;
          return (
            <Pressable
              key={x.key}
              accessibilityRole="button"
              accessibilityLabel={x.label}
              accessibilityState={x.key === 'clear' ? undefined : { selected: on }}
              onPress={() => (x.key === 'clear' ? onClear() : onTool(x.key))}
              className={cn(
                'h-[40px] w-[44px] items-center justify-center rounded-[11px]',
                on ? 'bg-raised' : 'active:bg-wax',
              )}
            >
              <Icon name={x.icon} size={20} color={on ? 'honey-text' : 'ink'} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

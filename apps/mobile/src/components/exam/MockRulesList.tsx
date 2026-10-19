import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text, type IconName } from '@/components/ui';
import { cn } from '@/lib/cn';

const RULES = [
  { icon: 'clock', title: 'exam.intro.rules.clockTitle', body: 'exam.intro.rules.clockBody' },
  { icon: 'check', title: 'exam.intro.rules.saveTitle', body: 'exam.intro.rules.saveBody' },
  { icon: 'pause', title: 'exam.intro.rules.pauseTitle', body: 'exam.intro.rules.pauseBody' },
  { icon: 'exam', title: 'exam.intro.rules.flagTitle', body: 'exam.intro.rules.flagBody' },
  { icon: 'chart', title: 'exam.intro.rules.chartTitle', body: 'exam.intro.rules.chartBody' },
] as const satisfies readonly { icon: IconName; title: string; body: string }[];

/** The mock's rules: server time, saved answers, no pause, flags, the analysis at the end. */
export function MockRulesList() {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('exam.intro.rulesA11y')}
      className="rounded-xl border border-border bg-surf px-3.5 py-1"
    >
      {RULES.map((rule, i) => (
        <View
          key={rule.title}
          accessible
          className={cn(
            'flex-row items-center gap-3 py-2.5',
            i < RULES.length - 1 && 'border-b border-border',
          )}
        >
          <View className="h-9 w-9 items-center justify-center rounded-sm bg-raised">
            <Icon name={rule.icon} size={20} color="honey-text" />
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="font-sans-black text-sm">{t(rule.title)}</Text>
            <Text tone="muted" className="text-xs">
              {t(rule.body)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

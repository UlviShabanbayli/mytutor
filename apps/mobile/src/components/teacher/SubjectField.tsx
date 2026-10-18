import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Sheet, StatusPill, Text } from '@/components/ui';

/** Subjects of the platform; only Riyaziyyat has a textbook yet, the rest are "Hazırlanır". */
const SUBJECTS = [
  { key: 'math', ready: true },
  { key: 'azLang', ready: false },
  { key: 'english', ready: false },
  { key: 'physics', ready: false },
  { key: 'biology', ready: false },
  { key: 'history', ready: false },
  { key: 'chemistry', ready: false },
  { key: 'geography', ready: false },
] as const;

export type SubjectKey = (typeof SUBJECTS)[number]['key'];

type SubjectFieldProps = { value: SubjectKey; onChange: (key: SubjectKey) => void };

/** The "Fənn" field: a 52pt select that opens a sheet of subjects. */
export function SubjectField({ value, onChange }: SubjectFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const label = t('teacher.classNew.subject');

  return (
    <View className="gap-1.5">
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${t(`teacher.subjects.${value}`)}`}
        onPress={() => setOpen(true)}
        className="h-[52px] flex-row items-center gap-2.5 rounded-md border-2 border-border bg-surf px-3.5 active:opacity-80"
      >
        <Icon name="book" size={20} color="honey-text" />
        <Text className="flex-1 font-sans-bold">{t(`teacher.subjects.${value}`)}</Text>
        <Icon name="down" size={20} color="muted" />
      </Pressable>
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('teacher.classNew.subjectSheet')}
      >
        <View accessibilityRole="radiogroup" className="gap-2">
          {SUBJECTS.map((s) => (
            <Pressable
              key={s.key}
              accessibilityRole="radio"
              accessibilityState={{ checked: s.key === value, disabled: !s.ready }}
              disabled={!s.ready}
              onPress={() => {
                onChange(s.key);
                setOpen(false);
              }}
              className="min-h-touch flex-row items-center gap-3 rounded-md border border-border bg-page px-3"
            >
              <Text
                className={
                  s.ready ? 'flex-1 font-sans-bold' : 'flex-1 font-sans-bold text-lock-ink'
                }
              >
                {t(`teacher.subjects.${s.key}`)}
              </Text>
              {s.ready ? (
                s.key === value ? (
                  <Icon name="check" size={20} color="honey-text" />
                ) : null
              ) : (
                <StatusPill kind="soon" label={t('teacher.soon.badge')} />
              )}
            </Pressable>
          ))}
        </View>
      </Sheet>
    </View>
  );
}

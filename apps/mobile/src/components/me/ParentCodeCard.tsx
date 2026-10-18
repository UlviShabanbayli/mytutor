import { useEffect, useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Text } from '@/components/ui';
import { canCopy, copyText } from '@/features/me/chat';
import { formatCode, formatMinSec, secondsLeft } from '@/features/me/codes';
import { PARENT_CODE_TTL_MS } from '@/features/me/demo';

type ParentCodeCardProps = {
  code: { value: string; expiresAt: number } | null;
  onGenerate: () => void;
  /** Offline: a code needs the server. */
  disabled?: boolean;
};

/** The student's short-lived parent code (architecture V1): generate, count down, copy, share. */
export function ParentCodeCard({ code, onGenerate, disabled = false }: ParentCodeCardProps) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const left = code ? secondsLeft(code.expiresAt, now) : 0;
  const active = code !== null && left > 0;

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);

  const shown = code ? formatCode(code.value) : '';

  return (
    <View
      accessibilityLabel={t('me.parentLink.codeLabel')}
      className="gap-2 rounded-xl bg-spot px-4 py-3.5"
    >
      <Text variant="overline" className="text-honey">
        {t('me.parentLink.overline')}
      </Text>
      {active ? (
        <>
          <Text
            accessibilityLabel={code.value.split('').join(' ')}
            selectable
            className="font-display-black text-4xl tracking-[3px] text-on-spot"
          >
            {shown}
          </Text>
          <View accessibilityLiveRegion="none" className="flex-row items-center gap-1.5">
            <Icon name="clock" size={16} color="on-spot" />
            <Text className="text-sm text-on-spot opacity-85">
              {t('me.parentLink.valid', {
                minutes: PARENT_CODE_TTL_MS / 60000,
                left: formatMinSec(left),
              })}
            </Text>
          </View>
          <View className="mt-1 flex-row gap-2">
            {canCopy ? (
              <View className="flex-1">
                <Button
                  size="md"
                  icon={copied ? 'check' : 'file'}
                  label={copied ? t('me.parentLink.copied') : t('me.parentLink.copy')}
                  onPress={() => {
                    void copyText(code.value).then(() => setCopied(true));
                  }}
                />
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void Share.share({ message: t('me.parentLink.shareMessage', { code: shown }) })
              }
              className="min-h-touch flex-1 flex-row items-center justify-center gap-1.5 rounded-md border-2 border-spot-line active:bg-spot-line"
            >
              <Icon name="send" size={18} color="on-spot" />
              <Text className="font-sans-black text-base text-on-spot">
                {t('me.parentLink.share')}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text className="text-sm text-on-spot opacity-90">
            {code ? t('me.parentLink.expired') : t('me.parentLink.intro')}
          </Text>
          <Button
            label={code ? t('me.parentLink.regenerate') : t('me.parentLink.generate')}
            icon="key"
            disabled={disabled}
            onPress={() => {
              setNow(Date.now());
              setCopied(false);
              onGenerate();
            }}
          />
        </>
      )}
    </View>
  );
}

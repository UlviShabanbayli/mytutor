import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Screen, ScreenHeader, Text } from '@/components/ui';
import {
  FONT_LICENSE_NAME,
  FONT_LICENSE_URL,
  FONTS,
  LIBRARIES,
  OFL_TEXT,
} from '@/features/me/licenses';
import { cn } from '@/lib/cn';

/** "Lisenziyalar": the shipped fonts with their OFL text, and the main open-source libraries. */
export function LicensesView() {
  const { t } = useTranslation();
  const [showText, setShowText] = useState(false);

  return (
    <Screen className="gap-3">
      <ScreenHeader title={t('me.licenses.title')} />
      <Text tone="muted">{t('me.licenses.intro')}</Text>
      <Text accessibilityRole="header" className="font-display-bold text-base">
        {t('me.licenses.fontsTitle')}
      </Text>
      {FONTS.map((f) => (
        <View key={f.id} className="gap-1 rounded-lg border border-border bg-surf px-3.5 py-3">
          <View className="flex-row items-baseline justify-between gap-2">
            <Text
              className={cn(
                'text-lg',
                f.family === 'display' ? 'font-display-black' : 'font-sans-black',
              )}
            >
              {f.name}
            </Text>
            <Text tone="muted" className="font-sans-bold text-xs">
              {f.id === 'onest' ? t('me.licenses.onestUse') : t('me.licenses.unboundedUse')}
            </Text>
          </View>
          <Text tone="muted" className="text-sm" selectable>
            {f.copyright}
          </Text>
          <Text className="font-sans-bold text-sm">{FONT_LICENSE_NAME}</Text>
        </View>
      ))}
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showText }}
          onPress={() => setShowText((v) => !v)}
          className="min-h-touch flex-1 flex-row items-center justify-center gap-1.5 rounded-md border-2 border-border px-2 active:bg-wax"
        >
          <Icon name="file" size={18} />
          <Text className="font-sans-bold text-sm">
            {showText ? t('me.licenses.hideText') : t('me.licenses.showText')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(FONT_LICENSE_URL)}
          className="min-h-touch flex-1 flex-row items-center justify-center gap-1.5 rounded-md border-2 border-border px-2 active:bg-wax"
        >
          <Icon name="link" size={18} />
          <Text className="font-sans-bold text-sm">{t('me.licenses.openSite')}</Text>
        </Pressable>
      </View>
      {showText ? (
        <View className="rounded-lg bg-box px-3.5 py-3">
          <Text selectable className="text-xs leading-[17px] text-ink">
            {OFL_TEXT}
          </Text>
        </View>
      ) : null}
      <Text accessibilityRole="header" className="font-display-bold text-base">
        {t('me.licenses.librariesTitle')}
      </Text>
      <View className="overflow-hidden rounded-lg border border-border bg-surf">
        {LIBRARIES.map((l, i) => (
          <View
            key={l.name}
            accessible
            accessibilityLabel={t('me.licenses.libraryLabel', l)}
            className={cn('min-h-12 justify-center px-3.5 py-2', i > 0 && 'border-t border-border')}
          >
            <View className="flex-row items-baseline justify-between gap-2">
              <Text className="font-sans-black text-sm">{l.name}</Text>
              <Text tone="muted" className="font-sans-bold text-xs">
                {l.license}
              </Text>
            </View>
            <Text tone="muted" className="text-xs">
              {`© ${l.holder}`}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

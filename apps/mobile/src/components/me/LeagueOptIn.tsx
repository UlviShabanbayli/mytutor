import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Icon, IconButton, type IconName, Text } from '@/components/ui';
import { useNickname } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';
import { LEAGUE_IDS } from '@/features/me/types';
import { cn } from '@/lib/cn';
import { FooterScreen } from './FooterScreen';
import { Hex } from './Hex';
import { NicknameSheet } from './NicknameSheet';

const PROMISES: { icon: IconName; key: 'separate' | 'leaveAnytime' }[] = [
  { icon: 'users', key: 'separate' },
  { icon: 'logout', key: 'leaveAnytime' },
];

/** Çiçək liqası is opt-in (architecture P2): what it is, what others see, then join or skip. */
export function LeagueOptIn() {
  const { t } = useTranslation();
  const nickname = useNickname();
  const join = useMeStore((s) => s.setLeagueJoined);
  const [editing, setEditing] = useState(false);
  const names = LEAGUE_IDS.map((id) => t(`me.leagues.${id}`));

  return (
    <FooterScreen
      header={
        <View className="-ml-3 flex-row">
          <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={router.back} />
        </View>
      }
      contentClassName="items-center"
      footer={
        <>
          <Button label={t('me.optIn.join')} onPress={() => join(true)} />
          <Button label={t('me.optIn.skip')} variant="text" size="md" onPress={router.back} />
        </>
      }
    >
      <Mascot mood="kesfiyyat" size={100} decorative />
      <Text variant="heading" className="text-center font-display-black text-2xl">
        {t('me.optIn.title')}
      </Text>
      <Text tone="muted" className="text-center leading-[22px]">
        {t('me.optIn.body')}
      </Text>
      <View
        accessible
        accessibilityLabel={t('me.optIn.leaguesLabel', { list: names.join(', ') })}
        className="flex-row flex-wrap justify-center gap-1"
      >
        {LEAGUE_IDS.map((id, i) => (
          <View
            key={id}
            className={cn(
              'h-8 justify-center rounded-full px-[9px]',
              i === 0 ? 'bg-honey' : i === LEAGUE_IDS.length - 1 ? 'bg-spot' : 'bg-raised',
            )}
          >
            <Text
              className={cn(
                'font-sans-black text-sm',
                i === 0 ? 'text-on-honey' : i === LEAGUE_IDS.length - 1 ? 'text-honey' : 'text-ink',
              )}
            >
              {t(`me.leagues.${id}`)}
            </Text>
          </View>
        ))}
      </View>
      <View
        accessibilityLabel={t('me.optIn.privacyLabel')}
        className="w-full rounded-[18px] border border-border bg-surf px-3 py-1"
      >
        <View className="min-h-11 flex-row items-center gap-2.5">
          <Icon name="eye" size={20} color="ok" />
          <Text className="flex-1 text-sm">
            <Text className="font-sans-black text-sm">{t('me.optIn.nicknameLead')}</Text>
            {t('me.optIn.nicknameRest')}
          </Text>
        </View>
        {PROMISES.map((p) => (
          <View
            key={p.key}
            className="min-h-11 flex-row items-center gap-2.5 border-t border-border"
          >
            <Icon name={p.icon} size={20} color="ok" />
            <Text className="flex-1 text-sm">{t(`me.optIn.${p.key}`)}</Text>
          </View>
        ))}
      </View>
      <View className="w-full flex-row items-center gap-2.5 rounded-lg bg-raised py-2 pl-3 pr-2">
        <Hex width={36} fill="honey">
          <Text className="font-sans-black text-base text-on-honey">{nickname.charAt(0)}</Text>
        </Hex>
        <View className="flex-1">
          <Text tone="muted" className="font-sans-bold text-xs">
            {t('me.optIn.nicknameCaption')}
          </Text>
          <Text className="font-sans-black text-base">{nickname}</Text>
        </View>
        <Button
          label={t('me.optIn.change')}
          icon="edit"
          variant="secondary"
          size="md"
          onPress={() => setEditing(true)}
        />
      </View>
      <Text tone="muted" className="text-center text-sm">
        {t('me.optIn.note')}
      </Text>
      <NicknameSheet visible={editing} onClose={() => setEditing(false)} />
    </FooterScreen>
  );
}

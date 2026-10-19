import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon, IconButton, Text } from '@/components/ui';
import type { LiveSession } from '@/features/me/types';
import { InfoSheet } from './InfoSheet';
import { LiveControls } from './LiveControls';
import { LiveStage } from './LiveStage';

type LiveLessonProps = { session: LiveSession };

/** A live lesson from the student's side (architecture M5): recorded, mic and camera off. */
export function LiveLesson({ session }: LiveLessonProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  const [hand, setHand] = useState(false);
  const [info, setInfo] = useState(false);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <View className="flex-row items-center gap-2 px-4 pb-1.5 pt-1">
        <View
          accessibilityRole="text"
          className="h-8 flex-row items-center gap-1.5 rounded-full bg-err-bg px-2.5"
        >
          <View className="h-2 w-2 rounded-full bg-err" />
          <Text className="font-sans-black text-xs tracking-[0.5px] text-err">
            {t('me.live.recording')}
          </Text>
        </View>
        <IconButton
          icon="info"
          color="err"
          accessibilityLabel={t('me.live.recordingInfo')}
          onPress={() => setInfo(true)}
        />
        <View className="flex-1" />
        <View
          accessible
          accessibilityLabel={t('me.live.participants', { count: session.participants })}
          className="flex-row items-center gap-1"
        >
          <Icon name="users" size={18} color="muted" />
          <Text tone="muted" className="font-sans-black text-sm">
            {session.participants}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={router.back}
          className="min-h-11 flex-row items-center gap-1.5 rounded-md bg-err px-3.5"
        >
          <Icon name="logout" size={18} color="page" />
          <Text className="font-sans-black text-sm text-page">{t('me.live.leave')}</Text>
        </Pressable>
      </View>
      <ScrollView className="flex-1" contentContainerClassName="flex-grow gap-2.5 px-4 pb-2">
        <View className="gap-px">
          <Text accessibilityRole="header" className="font-sans-black text-md">
            {t('me.live.title', { title: session.title })}
          </Text>
          <Text tone="muted" className="text-sm">
            {t('me.live.meta', {
              teacher: session.teacher,
              class: session.className,
              time: session.time,
            })}
          </Text>
        </View>
        <View className="flex-row items-start gap-2 rounded-md bg-raised px-3 py-2">
          <Icon name="video" size={16} color="err" />
          <Text className="flex-1 text-sm">
            {t(mic || camera ? 'me.live.recordingNoteOn' : 'me.live.recordingNote', {
              class: session.className,
            })}
          </Text>
        </View>
        {session.network === 'weak' ? (
          <View
            accessibilityRole="alert"
            className="flex-row items-center gap-2 rounded-md bg-err-bg px-3 py-2"
          >
            <Icon name="warning" size={18} color="err" />
            <Text className="flex-1 text-sm">
              <Text className="font-sans-black text-sm text-err">{t('me.live.weakLead')}</Text>
              {t('me.live.weakBody')}
            </Text>
          </View>
        ) : null}
        <LiveStage session={session} />
      </ScrollView>
      <View
        // The home indicator inset is device-specific, so it cannot be a static className.
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <LiveControls
          mic={mic}
          camera={camera}
          hand={hand}
          unread={session.unreadChat}
          onMic={() => setMic((v) => !v)}
          onCamera={() => setCamera((v) => !v)}
          onHand={() => setHand((v) => !v)}
          onChat={() =>
            router.push({ pathname: '/class/[id]/chat', params: { id: session.classId } })
          }
        />
      </View>
      <InfoSheet
        visible={info}
        title={t('me.live.infoTitle')}
        paragraphs={[t('me.live.infoBody1'), t('me.live.infoBody2')]}
        onClose={() => setInfo(false)}
      />
    </SafeAreaView>
  );
}

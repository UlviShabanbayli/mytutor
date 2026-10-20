import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Banner, Icon, Text } from '@/components/ui';
import { upperCase } from '@/lib/letterCase';
import { firstName, initials } from '@/features/teacher/people';
import { elapsedClock } from '@/features/teacher/time';
import type { LiveRoom, LiveTile, TeacherClass } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import { ConfirmSheet } from './ConfirmSheet';
import { type BoardTool, LiveBoard } from './LiveBoard';
import { LiveChatSheet } from './LiveChatSheet';
import { LiveControls } from './LiveControls';
import { LiveHeader } from './LiveHeader';
import { ParticipantTile } from './ParticipantTile';
import { RaisedHandRow } from './RaisedHandRow';

type LiveRoomViewProps = { room: LiveRoom; cls: TeacherClass };

/** The teacher's live room (M5). Demo: no audio or video service is connected yet. */
export function LiveRoomView({ room, cls }: LiveRoomViewProps) {
  const { t, i18n } = useTranslation();
  const f = useTeacherFormat();
  const [seconds, setSeconds] = useState(0);
  const [mic, setMic] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [mutedAll, setMutedAll] = useState(false);
  const [tool, setTool] = useState<BoardTool>('pen');
  const [board, setBoard] = useState(room.board);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [chat, setChat] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const weak = room.participants.find((p) => p.state === 'weak');
  const others = room.present - room.participants.length;
  const heading = room.topic
    ? `${room.topic.number} · ${upperCase(room.topic.title, i18n.language)}`
    : room.title;
  const label = (p: LiveTile) => {
    if (p.state === 'me') return mic ? t('teacher.live.meLabelOn') : t('teacher.live.meLabelOff');
    const name = p.name;
    if (p.state === 'hand') return t('teacher.live.handLabel', { name });
    if (p.state === 'weak') return t('teacher.live.weakLabel', { name });
    return t('teacher.live.mutedLabel', { name });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <LiveHeader
        title={t('teacher.live.title', { class: cls.shortName, title: room.title })}
        clock={elapsedClock(seconds)}
        present={room.present}
        total={room.total}
      />
      <ScrollView className="flex-1" contentContainerClassName="gap-2.5 px-4 pb-4 pt-1">
        <LiveBoard
          heading={heading}
          lines={board}
          tool={tool}
          onTool={setTool}
          onClear={() => setBoard([])}
        />
        <View accessibilityLabel={t('teacher.live.participants')} className="flex-row gap-1.5">
          {room.participants.map((p) => (
            <ParticipantTile
              key={p.id}
              kind={p.state === 'me' ? 'me' : mutedAll && p.state !== 'hand' ? 'muted' : p.state}
              initials={initials(p.name)}
              name={p.state === 'me' ? t('teacher.live.me') : firstName(p.name)}
              label={label(p)}
            />
          ))}
          {others > 0 ? (
            <ParticipantTile
              kind="more"
              initials={t('teacher.live.more', { count: others })}
              name={t('teacher.live.moreWord')}
              label={t('teacher.live.moreLabel', { count: others })}
            />
          ) : null}
        </View>
        {weak ? (
          <View accessibilityRole="alert" className="flex-row items-center gap-1.5">
            <Icon name="warning" size={15} color="err" />
            <Text variant="caption" tone="err">
              {t('teacher.live.weak', { name: weak.name })}
            </Text>
          </View>
        ) : null}
        {mutedAll ? <Banner kind="info" message={t('teacher.live.mutedAll')} /> : null}
        <View accessibilityLabel={t('teacher.live.handsLabel')} className="gap-1.5">
          <Text variant="overline" tone="muted" accessibilityRole="header">
            {t('teacher.live.hands', { count: room.hands.length })}
          </Text>
          {room.hands.length === 0 ? <Text tone="muted">{t('teacher.live.noHands')}</Text> : null}
          {room.hands.map((h, i) => (
            <RaisedHandRow
              key={h.studentId}
              name={h.name}
              when={f.ago(new Date(h.at))}
              first={i === 0}
              speaking={speaking === h.studentId}
              onToggle={() => setSpeaking((s) => (s === h.studentId ? null : h.studentId))}
            />
          ))}
        </View>
      </ScrollView>
      <LiveControls
        mic={mic}
        sharing={sharing}
        chatUnread={room.chatUnread}
        onMic={() => setMic((v) => !v)}
        onMuteAll={() => setMutedAll(true)}
        onShare={() => setSharing((v) => !v)}
        onChat={() => setChat(true)}
        onEnd={() => setEnding(true)}
      />
      <LiveChatSheet visible={chat} classId={cls.id} onClose={() => setChat(false)} />
      <ConfirmSheet
        visible={ending}
        danger
        title={t('teacher.live.endTitle')}
        body={t('teacher.live.endBody')}
        confirmLabel={t('teacher.live.endSubmit')}
        cancelLabel={t('teacher.live.stay')}
        onClose={() => setEnding(false)}
        onConfirm={() => (router.canGoBack() ? router.back() : router.replace('/teacher/classes'))}
      />
    </SafeAreaView>
  );
}

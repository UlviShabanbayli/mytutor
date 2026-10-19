import { useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CropEditor } from '@/components/ask/CropEditor';
import { NoPhotoState } from '@/components/ask/NoPhotoState';
import { SpotOutlineButton } from '@/components/ask/SpotOutlineButton';
import { Button, Icon, IconButton, type IconName, Text } from '@/components/ui';
import { DEFAULT_CROP } from '@/features/ask/crop';
import { useAskStore } from '@/features/ask/store';
import { cn } from '@/lib/cn';

function Tool(props: { icon: IconName; label: string; pressed?: boolean; onPress: () => void }) {
  const on = props.pressed === true;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      accessibilityState={props.pressed === undefined ? undefined : { selected: on }}
      onPress={props.onPress}
      className={cn(
        'h-14 w-16 items-center justify-center gap-0.5 rounded-md',
        on ? 'bg-spot-line' : 'active:bg-spot-line',
      )}
    >
      <Icon name={props.icon} size={22} color={on ? 'honey' : 'on-spot'} />
      <Text className={cn('font-sans-black text-xs', on ? 'text-honey' : 'text-on-spot')}>
        {props.label}
      </Text>
    </Pressable>
  );
}

/** Kəs və düzəlt: frame the one question, turn the photo, then go on to sending. */
export default function AskCropScreen() {
  const { t } = useTranslation();
  const draft = useAskStore((s) => s.draft);
  const rotate = useAskStore((s) => s.rotate);
  const setCrop = useAskStore((s) => s.setCrop);
  const [cropping, setCropping] = useState(true);

  if (!draft) return <NoPhotoState />;

  function next() {
    // A frame the student never moved is still the one shown on screen.
    setCrop(cropping ? (draft?.crop ?? DEFAULT_CROP) : null);
    router.push('/ask/send');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-spot">
      <StatusBar style="light" />
      <View className="flex-row items-center px-2 pb-2 pt-2">
        <IconButton
          icon="back"
          color="on-spot"
          accessibilityLabel={t('common.back')}
          onPress={router.back}
        />
        <Text
          accessibilityRole="header"
          className="flex-1 text-center font-sans-black text-md text-on-spot"
        >
          {t('ask.crop.title')}
        </Text>
        <View className="min-w-touch" />
      </View>
      <View className="flex-1 px-4 pt-1">
        <CropEditor draft={draft} cropping={cropping} onCropChange={setCrop} />
      </View>
      <View
        accessibilityRole="toolbar"
        accessibilityLabel={t('ask.crop.tools')}
        className="flex-row justify-center gap-6 px-4 pt-2.5"
      >
        <Tool
          icon="crop"
          label={t('ask.crop.crop')}
          pressed={cropping}
          onPress={() => setCropping((on) => !on)}
        />
        <Tool icon="rotate" label={t('ask.crop.rotate')} onPress={rotate} />
      </View>
      <View className="flex-row gap-2.5 px-4 pb-2 pt-3">
        <SpotOutlineButton
          label={t('ask.crop.retake')}
          icon="camera"
          onPress={() => router.replace('/ask/camera')}
          className="h-14 flex-1 rounded-lg"
        />
        <Button label={t('ask.crop.next')} onPress={next} className="flex-1" />
      </View>
    </SafeAreaView>
  );
}

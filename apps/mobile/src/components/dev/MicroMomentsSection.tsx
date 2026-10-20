import { useState } from 'react';
import { View } from 'react-native';
import { CaptureSheet } from '@/components/ask/CaptureSheet';
import { ViewfinderGuide } from '@/components/ask/ViewfinderGuide';
import { TimerPill } from '@/components/exam/TimerPill';
import { CodeBoxes } from '@/components/onboarding/CodeBoxes';
import { Button, Input, StatusPill, SuccessCheck, Text } from '@/components/ui';
import { GallerySection } from './GallerySection';

const MIN = 60_000;
const GOOD_CODE = '482917';

/** micro.field, otp, timer, camera, done and pill: the moments wired into screens. */
export function MicroMomentsSection() {
  const [phoneError, setPhoneError] = useState(false);
  const [code, setCode] = useState('');
  const [left, setLeft] = useState(5 * MIN + 3000);
  const [shot, setShot] = useState(false);
  const [snap, setSnap] = useState(0);
  const [done, setDone] = useState(0);
  const [approved, setApproved] = useState(false);

  return (
    <>
      <GallerySection title="Input · micro.field B">
        <Input
          label="Mobil nömrə"
          placeholder="50 123 45 67"
          keyboardType="phone-pad"
          error={phoneError ? '2 rəqəm çatışmır — nömrə 9 rəqəmdir.' : undefined}
        />
        <Button
          label={phoneError ? 'Səhvi gizlət' : 'Səhv göstər'}
          variant="secondary"
          size="md"
          onPress={() => setPhoneError((e) => !e)}
        />
      </GallerySection>
      <GallerySection title={`CodeBoxes · micro.otp A (düz kod ${GOOD_CODE})`}>
        <CodeBoxes
          value={code}
          onChange={setCode}
          length={6}
          kind="digits"
          autoFocus={false}
          normalize={(text) => text.replace(/\D/g, '').slice(0, 6)}
          error={code.length === 6 && code !== GOOD_CODE}
          accessibilityLabel="6 rəqəmli SMS kodu"
        />
      </GallerySection>
      <GallerySection title="TimerPill · micro.timer B">
        <View className="flex-row items-center gap-3">
          <TimerPill remainingMs={left} totalMs={60 * MIN} announce />
          <TimerPill remainingMs={left} totalMs={60 * MIN} size="sm" />
        </View>
        <Button
          label={left > 5 * MIN ? '05:00-a keç' : 'Geri: 05:03'}
          variant="secondary"
          size="md"
          onPress={() => setLeft((l) => (l > 5 * MIN ? 5 * MIN - 1000 : 5 * MIN + 3000))}
        />
      </GallerySection>
      <GallerySection title="Camera · micro.camera C">
        <View className="h-[300px] overflow-hidden rounded-2xl bg-spot">
          <ViewfinderGuide dim={shot} snap={snap} />
          {shot ? (
            <CaptureSheet
              uri={null}
              onRetake={() => setShot(false)}
              onContinue={() => setShot(false)}
            />
          ) : (
            <View className="absolute inset-x-0 bottom-3 items-center">
              <Button
                label="Şəkil çək"
                size="md"
                onPress={() => {
                  setSnap((n) => n + 1);
                  setShot(true);
                }}
              />
            </View>
          )}
        </View>
      </GallerySection>
      <GallerySection title="SuccessCheck · micro.done A">
        <SuccessCheck
          key={done}
          title="Sualın göndərildi"
          body="Müəllim yoxlayanda xəbər verəcəyik."
          className="rounded-xl border border-border bg-surf px-4 py-5"
        />
        <SuccessCheck
          key={`row${done}`}
          layout="row"
          body="Şikayətin göndərildi. Komanda baxacaq."
        />
        <Button label="Yenidən" variant="text" size="md" onPress={() => setDone((n) => n + 1)} />
      </GallerySection>
      <GallerySection title="StatusPill · micro.pill B">
        <View className="flex-row items-center gap-3">
          <StatusPill
            kind={approved ? 'teacher' : 'ai'}
            label={approved ? 'Müəllim təsdiqlədi' : 'AI cavabı · yoxlanır'}
          />
          <Text variant="caption" tone="muted">
            {approved ? 'Lalə Həsənova · indicə' : '4.3 · bu gün 16:40'}
          </Text>
        </View>
        <Button
          label={approved ? 'Yenidən: yoxlanır' : 'Müəllim təsdiqləsin'}
          variant="secondary"
          size="md"
          onPress={() => setApproved((a) => !a)}
        />
      </GallerySection>
    </>
  );
}

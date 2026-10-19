import { useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '@/features/transitions/toastStore';
import { Toast } from './Toast';

/** Where `showToast` messages appear: centred near the bottom, above every screen. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const toast = useToastStore((s) => s.toast);
  const clear = useToastStore((s) => s.clear);
  const id = toast?.id;
  const done = useCallback(() => {
    if (id !== undefined) clear(id);
  }, [clear, id]);

  if (!toast) return null;
  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-4 items-center"
      // The home indicator inset is device-specific, so it cannot be a static className.
      style={{ bottom: insets.bottom + 24 }}
    >
      <Toast key={toast.id} message={toast.message} onDone={done} />
    </View>
  );
}

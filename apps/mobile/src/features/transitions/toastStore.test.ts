import { showToast, useToastStore } from './toastStore';

describe('toast store', () => {
  it('shows one toast at a time and keeps a newer one when an old one clears', () => {
    showToast('Yadda saxlandı');
    const first = useToastStore.getState().toast;
    showToast('Yenə');
    const second = useToastStore.getState().toast;
    expect(second?.message).toBe('Yenə');
    if (first) useToastStore.getState().clear(first.id);
    expect(useToastStore.getState().toast).toEqual(second);
    if (second) useToastStore.getState().clear(second.id);
    expect(useToastStore.getState().toast).toBeNull();
  });
});

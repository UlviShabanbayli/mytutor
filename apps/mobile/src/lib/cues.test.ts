import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/features/me/settingsStore';
import { playCue } from './cues';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

describe('playCue', () => {
  beforeEach(() => jest.clearAllMocks());

  it('plays the cue chosen in the motion lab', () => {
    useSettingsStore.setState({ haptics: true });
    playCue('select');
    playCue('correct');
    playCue('wrong');
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('stays silent when the student turned haptics off', () => {
    useSettingsStore.setState({ haptics: false });
    playCue('reward');
    playCue('tap');
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import { useDemoPersona, useDemoPersonaStore } from './demoPersona';

describe('demo persona', () => {
  beforeEach(async () => {
    await act(async () => useDemoPersonaStore.getState().setPersona('nermin'));
  });

  it('starts as Nərmin and switches to the first-day student', async () => {
    const { result } = await renderHook(() => useDemoPersona());
    expect(result.current).toBe('nermin');
    await act(async () => useDemoPersonaStore.getState().setPersona('fresh'));
    expect(result.current).toBe('fresh');
  });

  it('is kept on the device', async () => {
    await act(async () => useDemoPersonaStore.getState().setPersona('fresh'));
    const saved = await AsyncStorage.getItem('mytutor-demo-persona');
    expect(JSON.parse(saved ?? '{}').state.persona).toBe('fresh');
  });
});

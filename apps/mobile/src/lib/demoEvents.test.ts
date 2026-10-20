import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import {
  demoEventsOf,
  resetDemo,
  stampDemoEvent,
  useDemoEventsStore,
  useDemoWrite,
} from './demoEvents';
import { useDemoPersonaStore } from './demoPersona';
import { queryClient } from './query-client';

const message = {
  type: 'message.sent',
  threadId: 'chat-7b',
  fromPersonId: 'nermin',
  text: 'Salam',
} as const;

describe('demo events', () => {
  beforeEach(async () => {
    await act(async () => {
      useDemoPersonaStore.getState().setPersona('nermin');
      useDemoEventsStore.setState({ events: { nermin: [], fresh: [] } });
    });
  });

  it('useDemoWrite stamps the event, keeps it for the persona and refetches every query', async () => {
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = await renderHook(() => useDemoWrite());
    await act(async () => result.current(message));
    const [event] = demoEventsOf('nermin');
    expect(event).toMatchObject(message);
    expect(event?.id).toMatch(/^ev-/);
    expect(Number.isNaN(Date.parse(event?.at ?? ''))).toBe(false);
    expect(demoEventsOf('fresh')).toEqual([]);
    expect(invalidate).toHaveBeenCalled();
    invalidate.mockRestore();
  });

  it('gives every event its own id', () => {
    const ids = new Set(Array.from({ length: 50 }, () => stampDemoEvent(message).id));
    expect(ids.size).toBe(50);
  });

  it('is kept on the device under ari-demo-events', async () => {
    await act(async () => useDemoEventsStore.getState().append('nermin', stampDemoEvent(message)));
    const saved = JSON.parse((await AsyncStorage.getItem('ari-demo-events')) ?? '{}');
    expect(saved.state.events.nermin).toHaveLength(1);
  });

  it('keeps at most 200 events, dropping the oldest', async () => {
    await act(async () => {
      for (let i = 0; i < 205; i++)
        useDemoEventsStore.getState().append('nermin', { ...stampDemoEvent(message), id: `e${i}` });
    });
    const events = demoEventsOf('nermin');
    expect(events).toHaveLength(200);
    expect(events[0]?.id).toBe('e5');
  });

  it('resetDemo clears only the current persona', async () => {
    await act(async () => {
      useDemoEventsStore.getState().append('nermin', stampDemoEvent(message));
      useDemoEventsStore.getState().append('fresh', stampDemoEvent(message));
    });
    await act(async () => resetDemo());
    expect(demoEventsOf('nermin')).toEqual([]);
    expect(demoEventsOf('fresh')).toHaveLength(1);
  });

  it('switching persona clears the query cache', async () => {
    const clear = jest.spyOn(queryClient, 'clear');
    await act(async () => useDemoPersonaStore.getState().setPersona('fresh'));
    expect(clear).toHaveBeenCalled();
    clear.mockRestore();
  });
});

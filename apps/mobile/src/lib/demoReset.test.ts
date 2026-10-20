import { act } from '@testing-library/react-native';
import { useExamStore } from '@/features/exam/store';
import { useLearnStore } from '@/features/learn/store';
import { useMeStore } from '@/features/me/store';
import { useParentLocalStore } from '@/features/parent/localStore';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { useTodayStore } from '@/features/today/store';
import { registerDemoReset, resetDemo } from './demoEvents';
import { useDemoPersonaStore } from './demoPersona';

describe('resetDemo', () => {
  beforeEach(async () => {
    await act(async () => useDemoPersonaStore.getState().setPersona('fresh'));
  });

  it('runs every registered reset with the current persona', () => {
    const seen: string[] = [];
    const unregister = registerDemoReset((persona) => seen.push(persona));
    resetDemo();
    unregister();
    resetDemo();
    expect(seen).toEqual(['fresh']);
  });

  it('brings the first-day screens back: every device store forgets its demo state', async () => {
    await act(async () => {
      useLearnStore.getState().pickTextbook('riyaziyyat-7', 'trims-7');
      useLearnStore.getState().skipPlacement('riyaziyyat-7');
      useTodayStore.getState().takeFirstStep('fresh');
      useTodayStore.getState().takeFirstStep('nermin');
      useTodayStore.getState().visit('2026-10-20');
      useTestSessionStore.getState().start('test-riyaziyyat-7-4-1');
      useExamStore.getState().setPlanPrefs({ target: '90', minutesPerDay: 90 });
      useExamStore.getState().registerMock('general-3');
      useParentLocalStore.getState().setPref('weeklyReport', false);
      useParentLocalStore.getState().report('m-1');
      useMeStore.getState().setNickname('Yeni_Ləqəb');
      useMeStore.getState().setLeagueJoined(false);
    });
    await act(async () => resetDemo());

    expect(useLearnStore.getState().byPersona.fresh).toBeUndefined();
    expect(useTodayStore.getState().firstStepTaken).toEqual(['nermin']);
    expect(useTodayStore.getState().lastVisit).toBeNull();
    expect(useTestSessionStore.getState().session).toBeNull();
    expect(useExamStore.getState()).toMatchObject({
      target: '75',
      minutesPerDay: 40,
      registeredMocks: [],
    });
    expect(useParentLocalStore.getState()).toMatchObject({ prefs: {}, reported: [] });
    expect(useMeStore.getState()).toMatchObject({ nickname: null, leagueJoined: true });
  });
});

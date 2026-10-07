// Source of truth for translation keys. ru/en must match this shape.
export const az = {
  common: {
    appName: 'MyTutor',
    loading: 'Yüklənir…',
    retry: 'Yenidən cəhd et',
    errorTitle: 'Xəta baş verdi',
    errorDescription: 'Nəsə alınmadı. İnternet bağlantını yoxlayıb yenidən cəhd et.',
    comingSoon: 'Tezliklə',
  },
  tabs: {
    home: 'Ana səhifə',
    ask: 'Sual ver',
    profile: 'Profil',
  },
  home: {
    greeting: 'Salam!',
    subtitle: 'Bu gün nə öyrənirik?',
    askTitle: 'Sualın var?',
    askDescription: 'Həll edə bilmədiyin sualın şəklini çək, addım-addım izahını al.',
    askAction: 'Sual ver',
    recentTitle: 'Suallarım',
    recentEmptyTitle: 'Hələ sualın yoxdur',
    recentEmptyDescription: 'Verdiyin suallar və onların cavabları burada görünəcək.',
  },
  ask: {
    title: 'Sual ver',
    emptyDescription: 'Burada sualının şəklini çəkib müəllimdən cavab ala biləcəksən.',
  },
  profile: {
    title: 'Profil',
    emptyDescription: 'Hesabına daxil olduqdan sonra profilin burada görünəcək.',
  },
};

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]>;
};
export type TranslationResource = DeepStringRecord<typeof az>;

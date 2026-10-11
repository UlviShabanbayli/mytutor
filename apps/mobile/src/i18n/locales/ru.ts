import type { TranslationResource } from './az';

export const ru: TranslationResource = {
  common: {
    appName: 'MyTutor',
    loading: 'Загрузка…',
    retry: 'Повторить',
    errorTitle: 'Произошла ошибка',
    errorDescription: 'Что-то пошло не так. Проверь подключение к интернету и попробуй снова.',
    comingSoon: 'Скоро',
  },
  tabs: {
    home: 'Главная',
    ask: 'Спросить',
    profile: 'Профиль',
  },
  home: {
    greeting: 'Привет!',
    subtitle: 'Что изучаем сегодня?',
    askTitle: 'Есть вопрос?',
    askDescription: 'Сфотографируй задачу, которую не можешь решить, и получи пошаговое решение.',
    askAction: 'Задать вопрос',
    recentTitle: 'Мои вопросы',
    recentEmptyTitle: 'У тебя пока нет вопросов',
    recentEmptyDescription: 'Здесь появятся твои вопросы и ответы на них.',
  },
  ask: {
    title: 'Задать вопрос',
    emptyDescription: 'Здесь ты сможешь сфотографировать вопрос и получить ответ от учителя.',
  },
  profile: {
    title: 'Профиль',
    emptyDescription: 'После входа в аккаунт здесь появится твой профиль.',
  },
};

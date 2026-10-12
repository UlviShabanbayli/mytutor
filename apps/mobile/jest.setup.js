/* global jest -- this file runs inside Jest */
require('./src/i18n');

// Native storage does not exist under Jest; the package ships an in-memory mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

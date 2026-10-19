/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  // Worklets ship a JS implementation next to the native one; Jest has no native runtime.
  resolver: 'react-native-worklets/jest/resolver',
};

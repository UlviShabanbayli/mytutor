import base from '@mytutor/config/eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  ...base,
  { files: ['src/**/*.{ts,tsx}'], languageOptions: { globals: { ...globals.browser } } },
  { files: ['src/**/*.{ts,tsx}'], ...reactHooks.configs.flat.recommended },
];

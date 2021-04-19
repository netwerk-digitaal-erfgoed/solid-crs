import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jest-environment-jsdom-sixteen',
  setupFiles: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  transformIgnorePatterns: ['node_modules/(?!(lit-element|lit-html|rx-lit)/)'],
  moduleNameMapper: {
    '~(.*)': '<rootDir>/lib/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};

export default config;
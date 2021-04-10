module.exports = {
  // testTimeout: 300000,
  // // moduleFileExtensions: [ 'js', 'ts' ],
  // rootDir: 'lib',
  // // testMatch: ['**/+(*.)+(spec).+(ts)'],
  // // transform: {
  // //   '^.+\\.(t|j)s$': 'ts-jest',
  // // },
  // preset: 'ts-jest',
  // globals: {
  //   'ts-jest': {
  //     babelConfig: false,
  //     tsconfig: '<rootDir>/../tsconfig.spec.json',
  //   },
  // },


  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jest-environment-jsdom-sixteen',
  setupFiles: ['<rootDir>/tests/setup.ts'],
  transformIgnorePatterns: ['node_modules/(?!(lit-element|lit-html)/)'],
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

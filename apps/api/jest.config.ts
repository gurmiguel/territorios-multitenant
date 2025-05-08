import { pathsToModuleNameMapper } from 'ts-jest'

import tsconfig from './tsconfig.json'

import type { Config } from 'jest'

const config: Config = {
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],
  roots: ['src'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  modulePaths: [tsconfig.compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths),
}

export default config

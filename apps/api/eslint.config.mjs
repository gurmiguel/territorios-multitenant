import { config } from '@repo/eslint-config/base'

/** @type {typeof config} */
export default [
  ...config,
  {
    ignores: [
      'src/generated/*',
    ],
  },
]

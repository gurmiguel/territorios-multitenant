import stylistic from '@stylistic/eslint-plugin'
import eslintImport from 'eslint-plugin-import'
import onlyWarn from 'eslint-plugin-only-warn'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  ...tseslint.configs.stylistic,
  {
    plugins: {
      '@stylistic': stylistic,
      'import': eslintImport,
      'turbo': turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'off',
      '@stylistic/linebreak-style': ['error', 'unix'],
      '@stylistic/indent': ['error', 2, {
        SwitchCase: 1,
      }],
      '@stylistic/comma-dangle': ['warn', 'always-multiline'],
      '@stylistic/comma-spacing': ['warn', {
        before: false,
        after: true,
      }],
      '@stylistic/quotes': ['warn', 'single', {
        avoidEscape: true,
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/semi': ['error', 'never', {
        beforeStatementContinuationChars: 'always',
      }],
      '@stylistic/arrow-spacing': ['warn', {
        before: true,
        after: true,
      }],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/jsx-max-props-per-line': ['warn', {
        maximum: {
          single: 4,
          multi: 2,
        },
      }],
      '@stylistic/jsx-self-closing-comp': ['error', {
        component: true,
        html: true,
      }],
      '@stylistic/jsx-sort-props': ['warn', {
        callbacksLast: true,
        shorthandLast: true,
        ignoreCase: true,
        noSortAlphabetically: true,
        reservedFirst: true,
      }],
      '@stylistic/jsx-wrap-multilines': ['error', {
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'parens-new-line',
        propertyValue: 'parens-new-line',
      }],
      '@stylistic/key-spacing': ['warn', {
        beforeColon: false,
        afterColon: true,
        mode: 'strict',
      }],
      '@stylistic/no-extra-parens': ['error', 'all', {
        ignoreJSX: 'all',
      }],
      '@stylistic/no-multi-spaces': ['warn', {
        ignoreEOLComments: true,
      }],
      '@stylistic/no-multiple-empty-lines': ['warn', {
        max: 1,
        maxBOF: 2,
        maxEOF: 0,
      }],
      '@stylistic/no-trailing-spaces': ['warn'],
      '@stylistic/padded-blocks': ['warn', 'never'],
      '@stylistic/quote-props': ['error', 'consistent-as-needed', {
        numbers: true,
      }],
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/template-curly-spacing': ['error', 'never'],
      '@stylistic/type-annotation-spacing': ['warn', {
        before: false,
        after: true,
      }],
      '@stylistic/type-generic-spacing': ['error'],
      '@stylistic/wrap-regex': ['error'],
      '@stylistic/switch-colon-spacing': ['error', {
        before: false,
        after: true,
      }],
      '@stylistic/space-infix-ops': ['error', {
        int32Hint: false,
      }],
      '@stylistic/space-unary-ops': ['error', {
        words: true,
        nonwords: false,
      }],
      'import/first': ['error'],
      'import/order': ['warn', {
        'groups': [
          ['builtin', 'internal'],
          'external',
          ['parent', 'sibling'],
          'index',
          'type',
          'object',
        ],
        'pathGroups': [
          {
            pattern: '@/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '~/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: 'server-only',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: 'client-only',
            group: 'builtin',
            position: 'before',
          },
        ],
        'pathGroupsExcludedImportTypes': ['builtin'],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc', caseInsensitive: true },
        'named': true,
      }],
      'import/newline-after-import': ['warn', {
        exactCount: true,
        considerComments: true,
      }],
      'import/no-duplicates': ['error', {
        'considerQueryString': true,
        'prefer-inline': true,
      }],
      'import/no-cycle': ['error'],
      'no-restricted-syntax': [ 'error', {
        selector: "ImportDeclaration[importKind!='type'][source.value='@workos-inc/node']",
        message: "Please use \'@/lib/workos\' instead",
      }],
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ['dist/**'],
  },
]

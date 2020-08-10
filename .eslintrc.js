module.exports = {
  root: true,
  'env': {
    'browser': true,
    'es6': true,
    'node': true
  },
  'extends': [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'project': 'tsconfig.json',
    'sourceType': 'module'
  },
  'plugins': [
    '@typescript-eslint',
    'prefer-arrow',
  ],
  'rules': {
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': 'allow-with-description'
      }
    ],
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        'selector': 'default',
        'format': ['camelCase'],
      },
      {
        'selector': 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        'leadingUnderscore': 'allow',
        'trailingUnderscore': 'allow'
      },
      {
        'selector': 'typeLike',
        format: ['PascalCase'],
      },
      {
        'selector': 'typeAlias',
        'format': ['PascalCase']
      },
      {
        'selector': 'property',
        'format': null
      },
    ],
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
	allowExpressions: false,
	allowTypedFunctionExpressions: true,
	allowHigherOrderFunctions: true
      }
    ],
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        'VariableDeclarator': 'first' ,
        'ObjectExpression': 'first',
        'ArrayExpression': 'first',
        'SwitchCase': 1
      }
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        'multiline': {
          'delimiter': 'semi',
          'requireLast': true
        },
        'singleline': {
          'delimiter': 'semi',
          'requireLast': false
        }
      }
    ],
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/quotes': [
      'error',
      'single'
    ],
    '@typescript-eslint/restrict-template-expressions': [
      'warn',
      {
        'allowNumber': true,
        'allowBoolean': true,
        'allowAny': true,
        'allowNullish': true
      }
    ],
    '@typescript-eslint/semi': [
      'error',
      'always'
    ],
    '@typescript-eslint/triple-slash-reference': 'error',
    '@typescript-eslint/unified-signatures': 'error',
    'camelcase': 'warn',
    'comma-dangle': 'off',
    'complexity': 'off',
    'constructor-super': 'error',
    'dot-notation': 'error',
    'eqeqeq': [
      'error',
      'smart'
    ],
    'guard-for-in': 'error',
    'id-blacklist': 'error',
    'id-match': 'error',
    'import/order': 'off',
    'max-classes-per-file': 'off',
    'new-parens': 'error',
    'no-bitwise': 'off',
    'no-caller': 'error',
    'no-cond-assign': 'error',
    'no-console': 'off',
    'no-debugger': 'error',
    'no-empty': 'error',
    'no-eval': 'error',
    'no-fallthrough': 'off',
    'no-invalid-this': 'off',
    'no-new-wrappers': 'error',
    'no-shadow': [
      'error',
      {
        'hoist': 'all'
      }
    ],
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': 'off',
    'no-unsafe-finally': 'error',
    'no-unused-expressions': 'error',
    'no-unused-labels': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'one-var': [
      'error',
      'never'
    ],
    'prefer-arrow/prefer-arrow-functions': [
      'warn',
      {
	'disallowPrototype': false,
        'singleReturnOnly': true,
        'classPropertiesAllowed': false
      }
    ],
    'prefer-const': 'error',
    'radix': 'error',
    'spaced-comment': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'off'
  }
};

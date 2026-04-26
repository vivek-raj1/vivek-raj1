import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

/** @see https://nextjs.org/docs/app/api-reference/config/eslint */
export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // App Router: fonts in root layout are valid; rule targets Pages router.
      '@next/next/no-page-custom-font': 'off',
      // React 19 / existing effects: hydration and media-query init are intentional.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'node_modules/**', 'next-env.d.ts']),
]);

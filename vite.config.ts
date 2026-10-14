/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    root: isDev ? 'demo' : process.cwd(),
    // Evita que copie favicon.svg e icons.svg a dist/ al compilar la librería
    publicDir: isDev ? 'public' : false,
    plugins: [
      react(),
      dts({
        tsconfigPath: './tsconfig.app.json',
        entryRoot: 'src/lib',
        include: ['src/lib'],
        insertTypesEntry: true
      }),
    ],
    build: {
      emptyOutDir: true,
      lib: {
        entry: `${import.meta.dirname}/src/lib/index.ts`,
        name: 'HeadlessReactPagination',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      root: process.cwd(),
      include: ['tests/**/*.test.ts'],
    },
  };
});
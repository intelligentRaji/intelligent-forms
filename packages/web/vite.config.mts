import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths({
      root: '../../',
    }),
  ],
  build: {
    sourcemap: true,
    target: 'es2020',
  },
  publicDir: false,
})

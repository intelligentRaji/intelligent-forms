import { defineConfig } from 'vite'
import { readdirSync } from 'fs'
import tsconfigPaths from 'vite-tsconfig-paths'

const components = readdirSync('src/', { recursive: true, encoding: 'utf-8' })
const componentsEntries = components
  .filter((component) => component.endsWith('.ts'))
  .map((component) => `src/${component}`)

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      entry: componentsEntries,
      formats: ['cjs', 'es'],
    },
    sourcemap: true,
    target: 'es2020',
  },
  publicDir: false,
})

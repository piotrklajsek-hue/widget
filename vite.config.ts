import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const isEmbed = mode === 'embed'

  return {
    plugins: [
      figmaAssetResolver(),
      react(),
      tailwindcss(),
      // Only inline CSS into JS for the embed build so a single <script>
      // tag is all a host page needs to load.
      ...(isEmbed ? [cssInjectedByJsPlugin()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
    ...(isEmbed
      ? {
          define: {
            'process.env.NODE_ENV': JSON.stringify('production'),
          },
          build: {
            lib: {
              entry: path.resolve(__dirname, 'src/embed.tsx'),
              name: 'LoclyWidget',
              formats: ['iife'] as const,
              fileName: () => 'locly-widget.js',
            },
            outDir: 'dist/embed',
            emptyOutDir: true,
            cssCodeSplit: false,
          },
        }
      : {}),
  }
})

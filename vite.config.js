import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '')
  
  // Make environment variables available in configuration
  console.log(`Running in ${mode} mode with env variables:`, env)
  
  return {
    assetsInclude: ['**/*.PNG'],
    plugins: [vue(), vueJsx(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api/rajaongkir': {
          target: 'https://api.rajaongkir.com/starter',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rajaongkir/, ''),
        },
      },
    },
    build: {
      // Generate source maps for easier debugging in production
      sourcemap: true,
    },
    define: {
      // Make environment variable available to client code
      '__APP_ENV__': JSON.stringify(mode),
    }
  }
})
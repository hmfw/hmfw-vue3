import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import SvgLoader from 'vite-svg-loader'
// import ElementPlus from 'unplugin-element-plus/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
          // directives: true,
          // version: "2.1.5",
        }),
      ],
    }),

    SvgLoader({
      defaultImport: 'component',
      svgo: true,
      svgoConfig: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                // 禁用 removeViewBox 插件，保留 viewBox 属性
                removeViewBox: false,
              },
            },
          },
        ],
      },
    }),

    // Components({
    //   resolvers: [ElementPlusResolver()],
    // }),
    command === 'build' && visualizer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@mario9/tiptap-editor/dist/tiptap-vue.css': resolve(
        __dirname,
        'node_modules/@mario9/tiptap-editor/dist/tiptap-vue.css'
      ),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element.scss" as *;`,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 可以添加其他需要分包的库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus-vendor': ['element-plus', '@element-plus/icons-vue'],
          echarts: ['echarts'],
          lodash: ['lodash'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
}))

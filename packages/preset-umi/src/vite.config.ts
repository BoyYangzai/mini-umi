import { defineConfig } from 'vite';
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.js', '.json', '.ts']
  },
  server: {
    proxy: {
      'http://localhost:3000':
        'http://101.43.191.122:3000/'
    }
  }
});
